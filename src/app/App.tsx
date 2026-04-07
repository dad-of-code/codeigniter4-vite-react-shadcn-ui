import { useRoutes } from "react-router-dom"
import { routes } from "./routes"

declare global {
  interface Window {
    __CI4__?: { shieldEnabled: boolean }
  }
}

export function App() {
  const element = useRoutes(routes)
  return element
}

export default App
