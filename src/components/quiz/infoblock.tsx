import React from "react";

type InfoBlockProps = {
  label: any;
  value: any;
};

const InfoBlock = ({ label, value }: InfoBlockProps) => {
  const renderContent = (input: any) => {
    if (input === null || input === undefined) return <span className="text-slate-400">Not specified</span>;
    if (typeof input === "boolean") return input ? "Yes" : "No";
    if (input instanceof Date) return input.toLocaleString();
    if (typeof input === "object" && !React.isValidElement(input)) return JSON.stringify(input);
    return React.isValidElement(input) ? input : input.toString();
  };

  return (
    <div>
      <p className="text-sm text-slate-600">{renderContent(label)}</p>
      <p className="font-medium text-slate-800">{renderContent(value)}</p>
    </div>
  );
};

export default InfoBlock;
