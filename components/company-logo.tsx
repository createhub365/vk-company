import Image from "next/image";
import { businessConfig } from "@/lib/config";

export function CompanyLogo({ alt = "VK AND COMPANY", className = "", priority = false }: {
  alt?: string;
  className?: string;
  priority?: boolean;
}) {
  return <span className={`brand-logo ${className}`} data-image-feedback="logo">
    <Image src={businessConfig.logoPath} width={500} height={500} alt={alt} preload={priority} unoptimized />
  </span>;
}
