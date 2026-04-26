import type { Environment } from "../../types";

type EnvironmentSelectorProps = {
  value: Environment;
  onChange: (environment: Environment) => void;
};

const environments: Environment[] = ["Development", "Staging", "Production"];

export function EnvironmentSelector({ value, onChange }: EnvironmentSelectorProps) {
  return (
    <div className="inline-flex rounded-md border border-line bg-white p-1">
      {environments.map((environment) => (
        <button
          key={environment}
          onClick={() => onChange(environment)}
          className={`h-7 rounded px-3 text-xs font-medium ${
            value === environment ? "bg-accentSoft text-accent" : "text-muted hover:bg-stone-50 hover:text-ink"
          }`}
        >
          {environment}
        </button>
      ))}
    </div>
  );
}
