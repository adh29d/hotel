import { redirect } from "next/navigation";
import { DEMO_ROOM } from "@/lib/mockData";

export default function HomePage() {
  redirect(`/room/${DEMO_ROOM}`);
}
