import { Router, Route } from "wouter";
import { Nav } from "@/components/Nav";
import { Home } from "@/pages/Home";
import { Compare } from "@/pages/Compare";
import { Sessions } from "@/pages/Sessions";

export function App() {
  return (
    <>
      <Nav />
      <main class="p-5">
        <Router>
          <Route path="/" component={Home} />
          <Route path="/compare" component={Compare} />
          <Route path="/sessions" component={Sessions} />
        </Router>
      </main>
    </>
  );
}
