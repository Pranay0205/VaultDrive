interface VaultIconProps {
  className?: string;
}

export default function VaultIcon({ className = "w-8 h-8" }: VaultIconProps) {
  return <img src="/src/assets/vault.svg" alt="VaultDrive" className={className} />;
}
