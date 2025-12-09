import { Routes, Route } from 'react-router-dom'
import AttractLoop from './pages/AttractLoop/AttractLoop'
import Debug from './pages/Debug/Debug'
import SampleConfig from './pages/Config/Config'
import KioskButton from './components/KioskButton'

function App(): React.JSX.Element {
  return (
    <>
      <ul className="flex absolute bottom-0 right-0">
        <li>
          <KioskButton
            to="/"
            className="inline-block bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
          >
            Attract Loop
          </KioskButton>
        </li>
        <li>
          <KioskButton
            to="/debug"
            className="inline-block bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
          >
            Debug
          </KioskButton>
        </li>
        <li>
          <KioskButton
            to="/config"
            className="inline-block bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
          >
            Sample Config
          </KioskButton>
        </li>
      </ul>
      <Routes>
        <Route path="/" element={<AttractLoop />} />
        <Route path="/debug" element={<Debug />} />
        <Route path="/config" element={<SampleConfig />} />
      </Routes>
      {/* <Versions /> */}
    </>
  )
}

export default App
