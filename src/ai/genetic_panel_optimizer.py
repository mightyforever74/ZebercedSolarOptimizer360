# C:\Projects\solar-optimizer360\src\ai\genetic_panel_optimizer.py
import random
import copy
from concurrent.futures import ThreadPoolExecutor

def rectangles_overlap(a, b):
    return not (
        a["x"] + a["width"] <= b["x"] or
        a["x"] >= b["x"] + b["width"] or
        a["y"] + a["height"] <= b["y"] or
        a["y"] >= b["y"] + b["height"]
    )

def is_valid_panel(panel, layout, obstacles, roof_width, roof_height):
    if (
        panel["x"] < 0 or
        panel["y"] < 0 or
        panel["x"] + panel["width"] > roof_width or
        panel["y"] + panel["height"] > roof_height
    ):
        return False
    for other in layout:
        if rectangles_overlap(panel, other):
            return False
    for obs in obstacles:
        if rectangles_overlap(panel, obs):
            return False
    return True

def crossover(parent1, parent2, roof_width, roof_height, panel_width, panel_height, obstacles):
    cut = len(parent1) // 2
    child_panels = parent1[:cut]
    for panel in parent2:
        if is_valid_panel(panel, child_panels, obstacles, roof_width, roof_height):
            child_panels.append(panel)
    return child_panels

def mutate(layout, roof_width, roof_height, panel_width, panel_height, obstacles, mutation_rate=0.1):
    new_layout = copy.deepcopy(layout)
    for i in range(len(new_layout)):
        if random.random() < mutation_rate:
            for _ in range(10):
                x = round(random.uniform(0, roof_width - panel_width), 3)
                y = round(random.uniform(0, roof_height - panel_height), 3)
                mutated_panel = {"x": x, "y": y, "width": panel_width, "height": panel_height}
                temp_layout = new_layout[:i] + new_layout[i+1:]
                if is_valid_panel(mutated_panel, temp_layout, obstacles, roof_width, roof_height):
                    new_layout[i] = mutated_panel
                    break
    return new_layout

def generate_random_layout(roof_width, roof_height, panel_width, panel_height, obstacles, max_panels):
    layout = []
    for _ in range(max_panels):
        for _ in range(10):
            x = round(random.uniform(0, roof_width - panel_width), 3)
            y = round(random.uniform(0, roof_height - panel_height), 3)
            new_panel = {"x": x, "y": y, "width": panel_width, "height": panel_height}
            if is_valid_panel(new_panel, layout, obstacles, roof_width, roof_height):
                layout.append(new_panel)
                break
    return layout

# ---- Reward/Fitness: panel sayısı baskın + alan ikincil ----
def fitness(layout):
    total_area = sum(p["width"] * p["height"] for p in layout)
    # Panel sayısı > alan. (Len*1000) kısmı α*#panel gibi davranır.
    return len(layout) * 1000 + total_area

def evaluate_population(population):
    with ThreadPoolExecutor() as executor:
        fitness_scores = list(executor.map(fitness, population))
    sorted_population = [x for _, x in sorted(zip(fitness_scores, population),
                                              key=lambda pair: pair[0], reverse=True)]
    return sorted_population, fitness_scores

def genetic_panel_placement(
    roof_width, roof_height, panel_width, panel_height, obstacles,
    generations=100, population_size=50, mutation_rate=0.1, max_panels=None
):
    # kaba üst sınır
    if max_panels is None:
        max_panels = max(1, int((roof_width * roof_height) / (panel_width * panel_height)))
    population = [
        generate_random_layout(roof_width, roof_height, panel_width, panel_height, obstacles, max_panels)
        for _ in range(population_size)
    ]
    best_layout = []
    best_fitness = -1

    for gen in range(generations):
        population, fitness_scores = evaluate_population(population)
        if fitness_scores[0] > best_fitness:
            best_layout = population[0]
            best_fitness = fitness_scores[0]

        # Elitizm: en iyi %20
        new_population = population[:max(1, population_size // 5)]
        while len(new_population) < population_size:
            parents = random.sample(population[:max(2, population_size // 2)], 2)
            child = crossover(parents[0], parents[1],
                              roof_width, roof_height, panel_width, panel_height, obstacles)
            child = mutate(child, roof_width, roof_height, panel_width, panel_height, obstacles, mutation_rate)
            new_population.append(child)
        population = new_population

    return best_layout[:max_panels] if max_panels is not None else best_layout
