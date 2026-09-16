import { FooterDepth } from "@/components/motion/utility-depth";
import Link from "next/link";
import { CompanyLogo } from "@/components/company-logo";
import { getPublicBusinessSettings } from "@/lib/business-settings";

export async function SiteFooter() {
  const settings=await getPublicBusinessSettings();
  return (
    <footer className="site-footer">
      <FooterDepth>
        <div className="footer-grid">
          <div className="footer-brand">
            <div className="brand footer-logo"><CompanyLogo alt="VK AND COMPANY"/> <span>VK AND COMPANY</span></div>
            <p>Domestic and international courier services, arranged around the details of each shipment.</p>
          </div>
          <div className="footer-col"><h3>Services</h3><Link href="/services/domestic">Domestic courier</Link><Link href="/services/international">International courier</Link><Link href="/get-a-quote">Request a quote</Link></div>
          <div className="footer-col"><h3>Company</h3><Link href="/about">About</Link><Link href="/contact">Contact</Link><Link href="/faq">FAQs</Link><Link href="/privacy">Privacy</Link><Link href="/terms">Terms</Link>{settings.email && <a href={`mailto:${settings.email}`}>Email us</a>}</div>
        </div>
        <div className="footer-bottom"><span>© {new Date().getFullYear()} VK AND COMPANY</span><span>Courier information is confirmed for each shipment.</span></div>
      </FooterDepth>
    </footer>
  );
}
