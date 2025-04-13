import React from "react";

const RoleCard = ({ title, description, features }) => {
  return (
    <div className="bg-white rounded-lg shadow-md p-6 h-full flex flex-col">
      <div className="mb-4 flex items-center justify-center">
        <div className={`text-white w-16 h-16 flex items-center justify-center rounded-full bg-[#004A57] text-2xl font-bold`}>
          {title.charAt(0)}
        </div>
      </div>
      <h3 className="text-black text-xl font-semibold mb-2 text-center">{title}</h3>
      <p className="text-gray-600 mb-6 text-center">{description}</p>
      <div className="mt-auto">
        <h4 className="font-medium mb-3 text-[#004A57]">Key Benefits:</h4>
        <ul className="space-y-3">
          {features.map((feature, index) => (
            <li key={index} className="flex items-start">
              <div className="flex-shrink-0 w-5 h-5 mr-2 bg-[#004A57] rounded-full flex items-center justify-center">
                <span className="text-white text-xs">✓</span>
              </div>
              <span className="text-sm text-gray-700">{feature.text}</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default RoleCard;
