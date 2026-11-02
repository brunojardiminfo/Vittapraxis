import { CabecalhoSite } from "@/components/cabecalho-site";
import { Rodape } from "@/components/rodape";

export default function SiteLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <CabecalhoSite />
      {children}
      <Rodape />
    </>
  );
}
