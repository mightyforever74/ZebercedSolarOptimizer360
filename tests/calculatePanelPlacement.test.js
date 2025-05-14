import { describe, it, expect } from 'vitest';
import { calculateOptimalPanelLayout } from '../src/utils/calculatePanelPlacement';

describe('calculateOptimalPanelLayout', () => {
  it('should return higher count for unobstructed layout (dikey wins here)', () => {
    const obstacles = [];
    const result = calculateOptimalPanelLayout(obstacles, 10, 6);

    // Beklenen: dikey yerleşim çünkü daha fazla panel sığıyor
    expect(result.orientation).toBe('Dikey');
    expect(result.count).toBeGreaterThan(0);
  });

  it('should handle obstacles correctly and reduce panel count', () => {
    const obstacles = [
      { type: 'chimney', width: 1.5, height: 1.5, position: { x: 3, y: 2 } },
    ];
    const result = calculateOptimalPanelLayout(obstacles, 11, 8.5);
    expect(result.count).toBeLessThan(55); // Engelli alanlar panel yerleşimini azaltmalı
  });

  it('should choose horizontal if both orientations yield same count', () => {
    const squareRoof = { width: 5.5, height: 3.4 };
    const result = calculateOptimalPanelLayout([], squareRoof.width, squareRoof.height);

    // Her iki yön aynı sayıda panel veriyorsa, varsayılan: Yatay seçilmeli
    expect(['Yatay', 'Farketmez']).toContain(result.orientation);
  });
});
