import { Routes, Route } from 'react-router-dom'
import AttractLoop from './pages/AttractLoop/AttractLoop'
import ParcelDetection from './pages/ParcelDetection/ParcelDetection'
import ParcelInformation from './pages/ParcelInformation/ParcelInformation'
import Complete from './pages/Complete/Complete'
import Debug from './pages/Debug/Debug'
import SampleConfig from './pages/Config/Config'

function App(): React.JSX.Element {
  return (
    <>
      <Routes>
        <Route path="/" element={<AttractLoop />} />
        <Route path="/attractloop" element={<AttractLoop />} />
        <Route path="/parceldetection" element={<ParcelDetection />} />
        <Route path="/parcelinformation" element={<ParcelInformation />} />
        <Route path="/complete" element={<Complete />} />
        <Route path="/debug" element={<Debug />} />
        <Route path="/config" element={<SampleConfig />} />
      </Routes>
      {/* <Versions /> */}
    </>
  )
}

export default App
