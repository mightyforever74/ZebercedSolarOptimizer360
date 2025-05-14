import React from 'react';

const UserInputForm = ({ onValidated }) => {
  const handleSubmit = (e) => {
    e.preventDefault();

    const validatedData = {
      timestamp: new Date().toISOString(),
      validated: true,
    };

    // Bu veri, üst bileşene (SolarAdvisorPage) gönderilecek
    onValidated(validatedData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 max-w-md text-center mx-auto">
      <p className="text-sm text-gray-600">
        Sistemin son kontrolleri tamamlandı. Devam etmek için onaylayın.
      </p>

      <button
        type="submit"
        className="bg-green-600 text-white px-6 py-2 rounded hover:bg-green-700"
      >
        ✅ Verileri Onayla ve Devam Et
      </button>
    </form>
  );
};

export default UserInputForm;
