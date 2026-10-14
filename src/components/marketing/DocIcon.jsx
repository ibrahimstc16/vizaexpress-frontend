import { BookUser, BriefcaseBusiness, Camera, FileSignature, HeartPulse, House } from 'lucide-react';

const icons = {
  passport: BookUser,
  photo: Camera,
  residence_proof: House,
  insurance: HeartPulse,
  work_contract: BriefcaseBusiness,
  application_form: FileSignature,
};

export default function DocIcon({ type, className }) {
  const Icon = icons[type] || FileSignature;
  return <Icon className={className} aria-hidden="true" />;
}
