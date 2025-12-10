import i18n from 'i18next'
import { initReactI18next, Trans } from 'react-i18next'

import logo from './logo.svg'
import bg from '@renderer/assets/bg.png'
import './AttractLoop.css'

const MESSAGES = {
  ATTRACTLOOP_PROMO_HEADING: 'Send your <main>Heart</main> Out',
  ATTRACTLOOP_PROMO_SUBHEADING: 'ParcelPebble can get your parcels out to anywhere nationwide.',
  ATTRACTLOOP_CALLTOACTIION_TEXT: 'Place your parcel on the scale to begin.'
}

const localI18n = i18n.createInstance()
localI18n.use(initReactI18next).init({
  resources: {
    en: { translation: MESSAGES }
  },
  lng: 'en',
  fallbackLng: 'en',
  interpolation: { escapeValue: false }
})

function AttractLoop(): React.JSX.Element {
  const onStart = () => {
    location.hash = '#/parceldetection'
  }

  return (
    <div
      className="w-screen h-screen flex bg-[#3b6680] bg-center bg-size-[2000px] bg-no-repeat animate-panblur"
      style={{ backgroundImage: `url(${bg})` }}
      onPointerDown={onStart}
    >
      <div className="p-20 w-full flex flex-col justify-between">
        <div>
          <h1 className="text-[6rem]/[6rem] uppercase font-bold w-[800px] text-white mb-5">
            <Trans
              i18n={localI18n}
              i18nKey="ATTRACTLOOP_PROMO_HEADING"
              components={{ main: <span className="text-[#fa5f4e] font-bold" /> }}
            />
          </h1>
          <h2 className="text-[2rem]/[2rem] font-bold w-[600px] text-white">
            <Trans i18n={localI18n} i18nKey="ATTRACTLOOP_PROMO_SUBHEADING" />
          </h2>
        </div>

        <div className="flex justify-between items-end">
          <div>
            <img src={logo} alt="ParcelPebble Logo" className="w-[300px] h-auto" />
          </div>
          <div>
            <h1 className="text-[3.5rem]/[3.5rem] text-right uppercase font-bold w-[500px] text-white">
              <Trans i18n={localI18n} i18nKey="ATTRACTLOOP_CALLTOACTIION_TEXT" />
            </h1>
          </div>
        </div>
      </div>
    </div>
  )
}

export default AttractLoop
