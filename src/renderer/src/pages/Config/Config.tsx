import React from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { RootState } from '../../store'
import { setServerAddressURL } from '../../features/config/configSlice'

const Config: React.FC = () => {
  const serverAddressURL = useSelector((state: RootState) => state.config.serverAddressURL)
  const unisonAddressURL = useSelector((state: RootState) => state.config.unisonAddressURL)
  const realSenseAddressURL = useSelector((state: RootState) => state.config.realSenseAddressURL)
  const casPD2AddressURL = useSelector((state: RootState) => state.config.casPD2AddressURL)
  const manifestAddressURL = useSelector((state: RootState) => state.config.manifestAddressURL)

  const dispatch = useDispatch()
  const [serverAddressURLInput, setServerAddressURLInput] = React.useState(serverAddressURL)
  const [unisonAddressURLInput, setUnisonAddressURLInput] = React.useState(unisonAddressURL)
  const [realSenseAddressURLInput, setRealSenseAddressURLInput] =
    React.useState(realSenseAddressURL)
  const [casPD2AddressURLInput, setCasPD2AddressURLInput] = React.useState(casPD2AddressURL)
  const [manifestAddressURLInput, setManifestAddressURLInput] = React.useState(manifestAddressURL)

  const submit = (): void => {
    dispatch(setServerAddressURL(serverAddressURLInput))
  }

  return (
    <div>
      <h2>Config URLs</h2>
      <p>Current Server Address URL: {serverAddressURL}</p>
      <p>Current Unison Address URL: {unisonAddressURL}</p>
      <p>Current RealSense Address URL: {realSenseAddressURL}</p>
      <p>Current CasPD2 Address URL: {casPD2AddressURL}</p>
      <p>Current Manifest Address URL: {manifestAddressURL}</p>

      <form
        onSubmit={(e) => {
          e.preventDefault()
          submit()
        }}
        className="my-3"
      >
        <div>
          <label>Server Address URL:</label>
          <input
            value={serverAddressURLInput}
            onChange={(e) => setServerAddressURLInput(e.target.value)}
            placeholder="serverAddressURL"
          />
        </div>

        <div>
          <label>Unison Address URL:</label>
          <input
            value={unisonAddressURLInput}
            onChange={(e) => setUnisonAddressURLInput(e.target.value)}
            placeholder="unisonAddressURL"
          />
        </div>

        <div>
          <label>RealSense Address URL:</label>
          <input
            value={realSenseAddressURLInput}
            onChange={(e) => setRealSenseAddressURLInput(e.target.value)}
            placeholder="realSenseAddressURL"
          />
        </div>

        <div>
          <label>CasPD2 Address URL:</label>
          <input
            value={casPD2AddressURLInput}
            onChange={(e) => setCasPD2AddressURLInput(e.target.value)}
            placeholder="casPD2AddressURL"
          />
        </div>

        <div>
          <label>Manifest Address URL:</label>
          <input
            value={manifestAddressURLInput}
            onChange={(e) => setManifestAddressURLInput(e.target.value)}
            placeholder="manifestAddressURL"
          />
        </div>

        <button
          type="submit"
          className="inline-block bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
        >
          Set
        </button>
      </form>
    </div>
  )
}

export default Config
