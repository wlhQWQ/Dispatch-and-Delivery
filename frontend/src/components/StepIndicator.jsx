import { Check } from "lucide-react";

export function StepIndicator({ currentStep }) {
  const steps = [
    { id: 1, name: "Order Details" },
    { id: 2, name: "Delivery Method" },
    { id: 3, name: "Confirmation" },
  ];

  return (
    <div className="w-full py-8">
      <div className="flex items-center justify-center space-x-4">
        {steps.map((step, index) => {
          const isCompleted = step.id < currentStep;
          const isCurrent = step.id === currentStep;

          return (
            <div key={step.id} className="flex items-center">
              {/* 连接线 */}
              {index !== 0 && (
                <div
                  className={`h-1 w-12 mx-2 rounded ${
                    isCompleted ? "bg-black" : "bg-gray-200"
                  }`}
                />
              )}

              {/* 圆圈和文字 */}
              <div className="flex flex-col items-center">
                <div
                  className={`flex items-center justify-center w-8 h-8 rounded-full border-2 transition-all duration-300
                    ${isCompleted ? "bg-black border-black text-white" : ""}
                    ${
                      isCurrent
                        ? "border-black text-black font-bold scale-110"
                        : "border-gray-300 text-gray-300"
                    }
                  `}
                >
                  {isCompleted ? <Check className="w-4 h-4" /> : step.id}
                </div>
                <span
                  className={`text-xs mt-2 font-medium ${
                    isCurrent ? "text-gray-900" : "text-gray-400"
                  }`}
                >
                  {step.name}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
