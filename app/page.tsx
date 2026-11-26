import { Header } from "@/components/Header";
import { Booking } from "@/components/sections/Booking";
import { Footer } from "@/components/sections/Footer";
import { Hero } from "@/components/sections/Hero";
import { Marquee } from "@/components/sections/Marquee";
import { Reviews } from "@/components/sections/Reviews";
import { Services } from "@/components/sections/Services";
import { Process } from "@/components/sections/Process";
import { Visit } from "@/components/sections/Visit";

export default function Home() {
  return (
    <>
      <Header />
      <main>
        <Hero />
        <Marquee />
        <Services />
        <Process />
        <Reviews />
        <Visit />
        <Booking />
      </main>
      <Footer />
    </>
  );
}
