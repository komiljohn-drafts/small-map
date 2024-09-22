import dynamic from "next/dynamic";

const CustomMap = dynamic(() => import("./ui/CustomMap"), { ssr: false });

export default function Home() {
  return <CustomMap />;
}
