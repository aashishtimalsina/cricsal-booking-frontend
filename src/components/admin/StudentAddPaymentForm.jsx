import { useState } from 'react';
import Button from '../ui/Button';
import Input from '../ui/Input';
import NepaliDateField from '../ui/NepaliDateField';
import { addStudentPayment } from '../../api/students';
import { useToast } from '../../context/ToastContext';
import {
  ACADEMY_PACKAGES,
  ACADEMY_PAYMENT_TYPES,
  ACADEMY_PAYMENT_CATEGORIES,
} from '../../constants/academy';

export default function StudentAddPaymentForm({ studentId, onSuccess, onCancel }) {
  const { showToast } = useToast();
  const [saving, setSaving] = useState(false);
  const [payNp, setPayNp] = useState('');
  const [pay, setPay] = useState({
    payment_date_en: '',
    amount: 0,
    payment_type: 'qr',
    payment_category: 'full',
    package: '1_month',
    notes: '',
  });

  async function submitPayment(e) {
    e.preventDefault();
    setSaving(true);
    try {
      const { data } = await addStudentPayment(studentId, {
        ...pay,
        payment_date_np: payNp,
        amount: Number(pay.amount),
      });
      const sms = data?.payment_received_sms;
      if (sms?.success) {
        showToast('Payment recorded. Receipt SMS sent.');
      } else if (sms?.reason === 'duplicate_same_day') {
        showToast('Payment recorded. Receipt SMS skipped (already sent today).');
      } else if (sms?.reason === 'skipped' || sms?.reason === 'no_phone') {
        showToast('Payment recorded');
      } else {
        showToast('Payment recorded. Receipt SMS could not be sent.');
      }
      setPayNp('');
      setPay({
        payment_date_en: '',
        amount: 0,
        payment_type: 'qr',
        payment_category: 'full',
        package: '1_month',
        notes: '',
      });
      onSuccess?.();
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed');
    } finally {
      setSaving(false);
    }
  }

  return (
    <form className="space-y-3" onSubmit={submitPayment}>
      <NepaliDateField
        label="Payment date (BS)"
        value={payNp}
        onChange={setPayNp}
        onAdDateChange={(ad) => setPay((prev) => ({ ...prev, payment_date_en: ad }))}
      />
      <Input
        label="Payment date (AD)"
        type="date"
        value={pay.payment_date_en}
        onChange={(e) => setPay({ ...pay, payment_date_en: e.target.value })}
        required
      />
      <Input
        label="Amount"
        type="number"
        min={0}
        step="0.01"
        value={pay.amount}
        onChange={(e) => setPay({ ...pay, amount: e.target.value })}
        required
      />
      <fieldset className="text-sm">
        <legend className="font-medium text-gray-800">Payment type</legend>
        <div className="mt-1 flex flex-wrap gap-4">
          {ACADEMY_PAYMENT_TYPES.map(({ value, label }) => (
            <label key={value} className="flex items-center gap-2">
              <input
                type="radio"
                name={`payment_type_${studentId}`}
                checked={pay.payment_type === value}
                onChange={() => setPay({ ...pay, payment_type: value })}
              />
              {label}
            </label>
          ))}
        </div>
      </fieldset>
      <fieldset className="text-sm">
        <legend className="font-medium text-gray-800">Category</legend>
        <div className="mt-1 flex flex-wrap gap-4">
          {ACADEMY_PAYMENT_CATEGORIES.map(({ value, label }) => (
            <label key={value} className="flex items-center gap-2">
              <input
                type="radio"
                name={`payment_category_${studentId}`}
                checked={pay.payment_category === value}
                onChange={() => setPay({ ...pay, payment_category: value })}
              />
              {label}
            </label>
          ))}
        </div>
      </fieldset>
      <label className="flex flex-col gap-1 text-sm">
        <span className="font-medium text-gray-700">Package</span>
        <select
          className="rounded-lg border border-gray-300 px-3 py-2 text-sm"
          value={pay.package}
          onChange={(e) => setPay({ ...pay, package: e.target.value })}
        >
          {ACADEMY_PACKAGES.map(({ value, label }) => (
            <option key={value} value={value}>
              {label}
            </option>
          ))}
        </select>
      </label>
      <Input label="Notes" value={pay.notes} onChange={(e) => setPay({ ...pay, notes: e.target.value })} />
      <div className="flex justify-end gap-2 pt-2">
        {onCancel && (
          <Button type="button" variant="secondary" onClick={onCancel}>
            Cancel
          </Button>
        )}
        <Button type="submit" disabled={saving}>
          {saving ? 'Saving…' : 'Save payment'}
        </Button>
      </div>
    </form>
  );
}
