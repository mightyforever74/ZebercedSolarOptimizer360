import React from 'react';


const steps = [
  { key: 'roof', label: 'Çatı Tanımı' },
  { key: 'obstacles', label: 'Engeller' },
  { key: 'layout', label: 'Yerleşim' },
];

export default function StepProgress({ currentStep }) {
  const currentIndex = steps.findIndex(s => s.key === currentStep);

  return (
    <motion.div
      className="flex items-center mb-6"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      {steps.map((step, idx) => {
        const isActive = idx <= currentIndex;
        return (
          <React.Fragment key={step.key}>
            <motion.div
              className="flex flex-col items-center"
              whileHover={{ scale: 1.1 }}
            >
              <div
                className={
                  `w-8 h-8 flex items-center justify-center rounded-full ` +
                  (isActive
                    ? 'bg-brand-primary text-white'
                    : 'bg-gray-300 text-gray-600')
                }
              >
                {idx + 1}
              </div>
              <span
                className={
                  `mt-2 text-xs font-medium ` +
                  (isActive ? 'text-brand-primary' : 'text-gray-500')
                }
              >
                {step.label}
              </span>
            </motion.div>

            {idx < steps.length - 1 && (
              <motion.div
                className={
                  `flex-1 h-1 mx-2 rounded ` +
                  (idx < currentIndex ? 'bg-brand-primary' : 'bg-gray-300')
                }
                initial={{ scaleX: 0 }}
                animate={{ scaleX: idx < currentIndex ? 1 : 0.2 }}
                transition={{ duration: 0.4 }}
              />
            )}
          </React.Fragment>
        );
      })}
    </motion.div>
  );
}