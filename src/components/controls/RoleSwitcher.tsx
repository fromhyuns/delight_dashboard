import { roles } from "../../data/mockData";
import type { Role } from "../../types";

type RoleSwitcherProps = {
  value: Role;
  onChange: (role: Role) => void;
};

export function RoleSwitcher({ value, onChange }: RoleSwitcherProps) {
  return (
    <label className="flex items-center gap-2 text-xs text-muted">
      Role
      <select
        value={value}
        onChange={(event) => onChange(event.target.value as Role)}
        className="h-9 rounded-md border border-line bg-white px-2 text-sm font-medium text-ink outline-none focus:border-accent"
      >
        {roles.map((role) => (
          <option key={role} value={role}>
            {role}
          </option>
        ))}
      </select>
    </label>
  );
}
