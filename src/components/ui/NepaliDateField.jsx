import { NepaliDatePicker } from 'nepali-datepicker-reactjs';
import 'nepali-datepicker-reactjs/dist/index.css';

export default function NepaliDateField({ label, value, onChange }) {
  return (
    <div className="flex flex-col gap-1">
      <label className="text-sm font-medium text-gray-700">{label}</label>
      <NepaliDatePicker
        inputClassName="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-green-500 focus:outline-none focus:ring-2 focus:ring-green-500"
        value={value || ''}
        onChange={(val) => onChange(val)}
        options={{ calenderLocale: 'ne', valueLocale: 'en' }}
      />
    </div>
  );
}
