import { CtaBanner } from "@/components/landing/cta-banner";
import { FeatureGrid } from "@/components/landing/feature-grid";
import { Hero } from "@/components/landing/hero";
import { ProductPreview } from "@/components/landing/product-preview";
import { RoleBenefits } from "@/components/landing/role-benefits";
import { Workflow } from "@/components/landing/workflow";

export default function Home() {
  return (
    <main className="mx-auto flex min-h-screen w-full max-w-7xl flex-col gap-4 px-6 py-6 sm:px-10 sm:py-8 lg:px-12">
      <Hero />
      <Workflow />
      <FeatureGrid />
      <RoleBenefits />
      <ProductPreview />
      <CtaBanner />
    </main>
  );
}
