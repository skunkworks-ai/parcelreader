import React from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { RootState } from '../../store'
import {
  setServerAddressURL,
  setUnisonAddressURL,
  setRealSenseAddressURL,
  setCasPD2AddressURL,
  setManifestAddressURL
} from '../../features/config/configSlice'
// import KioskButton from '@renderer/components/KioskButton/KioskButton'
import ControlledInput from '@renderer/contexts/KeyboardProvider/ControlledInput'

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
    dispatch(setUnisonAddressURL(unisonAddressURLInput))
    dispatch(setRealSenseAddressURL(realSenseAddressURLInput))
    dispatch(setCasPD2AddressURL(casPD2AddressURLInput))
    dispatch(setManifestAddressURL(manifestAddressURLInput))
  }

  return (
    <div className="p-10">
      <h1 className="font-bold text-2xl">Config URLs</h1>
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
          <ControlledInput
            value={serverAddressURLInput}
            setValue={setServerAddressURLInput}
            placeholder="serverAddressURL"
          />
        </div>

        <div>
          <label>Unison Address URL:</label>
          <ControlledInput
            value={unisonAddressURLInput}
            setValue={setUnisonAddressURLInput}
            placeholder="unisonAddressURL"
          />
        </div>

        <div>
          <label>RealSense Address URL:</label>
          <ControlledInput
            value={realSenseAddressURLInput}
            setValue={setRealSenseAddressURLInput}
            placeholder="realSenseAddressURL"
          />
        </div>

        <div>
          <label>CasPD2 Address URL:</label>
          <ControlledInput
            value={casPD2AddressURLInput}
            setValue={setCasPD2AddressURLInput}
            placeholder="casPD2AddressURL"
          />
        </div>

        <div>
          <label>Manifest Address URL:</label>
          <ControlledInput
            value={manifestAddressURLInput}
            setValue={setManifestAddressURLInput}
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
