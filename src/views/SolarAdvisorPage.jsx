import React, { useState, useEffect } from 'react';
import UserInputForm from '../components/UserInputForm';
import ObstacleEditor from '../components/ObstacleEditor';
import PanelLayoutVisualizer from '../components/PanelLayoutVisualizer';
import { calculateOptimalPanelLayout } from '../utils/calculatePanelPlacement';

const questions = [
  { id: 1, label: "What are the roof's dimensions in meters? (length x width)", key: 'dimensions' },
  { id: 2, label: "What is the roof's heading? (magnetic course in degrees)", key: 'heading' },
  { id: 3, label: "Enter GPS coordinates (latitude, longitude)", key: 'gps' },
  { id: 4, label: "What is the elevation of the installation site? (in meters above sea level)", key: 'elevation' },
  { id: 5, label: "What is the slope of the roof in degrees?", key: 'slope' },
  { id: 6, label: "Obstacle Editor", key: 'obstacles' },
  { id: 7, label: "What is the roof's weight limitation? (e.g., kg/cm²)", key: 'weightLimit' },
  { id: 8, label: "What is the monthly energy need? (in kWh) or type 'unrestricted'", key: 'energyNeed' },
];


export default function SolarAdvisorPage() {
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState(() => {
    const saved = localStorage.getItem('solarAnswers');
    return saved ? JSON.parse(saved) : { obstacles: [] };
  });
  const [input, setInput] = useState("");
  const [confirmed, setConfirmed] = useState(false);
  const [obstaclesCleared, setObstaclesCleared] = useState(false);

  useEffect(() => {
    localStorage.setItem('solarAnswers', JSON.stringify(answers));
  }, [answers]);

  const handleNext = () => {
    if (input.trim() === "") return;
    const key = questions[step].key;
    const updatedAnswers = { ...answers, [key]: input };
    setAnswers(updatedAnswers);
    setInput("");
    setStep(step + 1);
  };

  const handleFormValidated = (data) => {
    setAnswers(prev => ({ ...prev, validated: data }));
    setConfirmed(true);
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
      <div className="w-full max-w-xl bg-white rounded shadow p-6">
        {step < questions.length ? (
          step === 5 && answers.dimensions ? (
  <>
    {!obstaclesCleared && (() => {
      const cleared = { ...answers, obstacles: [] };
      setAnswers(cleared);
      setObstaclesCleared(true);
    })()}
    
    <ObstacleEditor
      roofWidth={parseFloat(answers.dimensions.split('x')[0])}
      roofHeight={parseFloat(answers.dimensions.split('x')[1])}
      onObstaclePlaced={(newObstacle) => {
        const updated = [...(answers.obstacles || []), newObstacle];
        setAnswers({ ...answers, obstacles: updated });
      }}
      onComplete={() => {
        const roofWidth = parseFloat(answers.dimensions.split('x')[0]);
        const roofHeight = parseFloat(answers.dimensions.split('x')[1]);
        const result = calculateOptimalPanelLayout(answers.obstacles, roofWidth, roofHeight);

        setAnswers(prev => ({
          ...prev,
          panelLayout: result.layout,
          panelStats: {
            count: result.count,
            orientation: result.orientation,
            power: result.power,
          }
        }));

        setStep(step + 1);
      }}
    />
  </>
): (
            <div>
              {step > 0 && (
                <div className="mb-6 p-4 bg-gray-100 rounded text-sm text-gray-700 shadow-sm">
                  <h3 className="font-semibold mb-2 text-gray-800">📋 Previous Answers:</h3>
                  <ul className="list-disc pl-5 space-y-1">
                    {questions.slice(0, step).map((q) => (
                      <li key={q.key}>
                        <strong>{q.label}:</strong>{" "}
                        {q.key === 'obstacles' ? (
                          <ul className="ml-4 list-square">
                            {(answers[q.key] || []).map((obs, i) => (
                              <li key={i}>
                                {i + 1}. {obs.type} – {obs.width}m x {obs.height}m at ({obs.position?.x ?? '—'}, {obs.position?.y ?? '—'})
                              </li>
                            ))}
                          </ul>
                        ) : (
                          answers[q.key] || '—'
                        )}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              <h2 className="text-xl font-semibold mb-4 text-gray-800">
                {questions[step].label}
              </h2>
              <input
                type="text"
                className="w-full border p-2 rounded mb-2"
                value={input}
                onChange={(e) => setInput(e.target.value)}
              />

              {step === 0 && <p className="text-yellow-700 text-sm mb-2">⚠️ Format: “10x5” (meters)</p>}
              {step === 1 && <p className="text-yellow-700 text-sm mb-2">⚠️ Compass heading (0°–360°)</p>}
              {step === 2 && <p className="text-yellow-700 text-sm mb-2">⚠️ Format: latitude, longitude</p>}
              {step === 3 && <p className="text-yellow-700 text-sm mb-2">⚠️ Elevation in meters</p>}
              {step === 4 && <p className="text-yellow-700 text-sm mb-2">⚠️ Roof slope 0°–60°</p>}
              {step === 6 && <p className="text-yellow-700 text-sm mb-2">⚠️ Format: 0.15 kg/cm²</p>}
              {step === 7 && <p className="text-yellow-700 text-sm mb-2">⚠️ Daily need 0.5–30 kWh or “unrestricted”</p>}

              <button
                onClick={handleNext}
                className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
              >
                Next
              </button>
            </div>
          )
        ) : confirmed ? (
          <div className="text-center">
            <h2 className="text-green-700 text-lg font-semibold mb-4">🎉 All data received!</h2>
            <p className="text-sm text-gray-600">Analysis will begin shortly.</p>
          </div>
        ) : (
          <div>
            <UserInputForm onValidated={handleFormValidated} />

           {answers.dimensions && step >= 8 && answers.panelLayout && (
  <>
    <div className="bg-green-50 text-green-800 p-4 rounded mb-4">
      ✅ <strong>{answers.panelStats?.count}</strong> panel yerleştirildi (
      {answers.panelStats?.orientation}) • ⚡ <strong>{answers.panelStats?.power} kW</strong>
    </div>

    <PanelLayoutVisualizer
      panelLayout={answers.panelLayout}
      roofWidth={parseFloat(answers.dimensions.split('x')[0])}
      roofHeight={parseFloat(answers.dimensions.split('x')[1])}
    />
  </>
)}


          </div>
        )}
      </div>
    </div>
  );
}