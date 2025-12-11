import { useState, useEffect } from 'react'
import i18n from 'i18next'
import { initReactI18next, Trans } from 'react-i18next'

import KioskButton from '@renderer/components/KioskButton/KioskButton'
import box from './box.svg'
import logo from './logo.svg'
import bg from '@renderer/assets/bg.png'
import send from './send.svg'
import './Complete.css'

const MESSAGES = {
  COMPLETE_HEADING: '<main><block>All Good!</block>Thank you for choosing ParcelPebble!</main>',
  COMPLETE_SUBHEADING: 'Carry your parcel to the drop off chute on your right.'
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

function Complete(): React.JSX.Element {
  const [timeRemaining, setTimeRemaining] = useState(5)

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeRemaining((prev) => {
        const newValue = prev - 1
        if (newValue <= 0) {
          location.hash = '#/attractloop'
          clearInterval(timer)
          return 0
        }
        return newValue
      })
    }, 1000)

    return () => clearInterval(timer)
  }, [])

  const onContinue = () => {
    location.hash = '#/parceldetection'
  }

  const onClose = () => {
    location.hash = '#/attractloop'
  }

  return (
    <div
      id="parcel-detection-page"
      className="w-screen h-screen flex bg-[#3b6680] bg-center bg-size-[3600px] bg-no-repeat"
      style={{
        backgroundImage: `linear-gradient(rgba(255, 255, 255, 0.8), rgba(255, 255, 255, 0.8)), url(${bg})`
      }}
    >
      <div className="p-20 w-full flex flex-col justify-between">
        <div>
          <div className="flex justify-between items-center mb-20">
            <div>
              <img src={logo} alt="ParcelPebble Logo" className="w-[180px] h-auto" />
            </div>
            <div></div>
          </div>

          <div className="flex justify-center flex-col items-center">
            <div className="relative w-[750px] h-[500px] z-1 flex flex-col justify-end">
              <img src={box} alt="Parcel Box" className="w-[500px] h-auto mx-auto" />
            </div>

            <div>
              <div className="w-[900px] bg-white rounded-3xl p-10 pt-70 -mt-60 text-black">
                <h1 className="w-[480px] text-[2.4rem]/[2.4rem] font-bold text-black mb-10">
                  <Trans
                    i18n={localI18n}
                    i18nKey="COMPLETE_HEADING"
                    components={{
                      main: <span className="text-[#fa5f4e] block" />,
                      block: <span className="block" />
                    }}
                  />
                </h1>
                <h2 className="w-[700px] text-[2.4rem]/[2.4rem] font-bold text-[#2E3D3B] mb-10">
                  <Trans
                    i18n={localI18n}
                    i18nKey="COMPLETE_SUBHEADING"
                    components={{
                      main: <span className="text-[#fa5f4e] block" />,
                      block: <span className="block" />
                    }}
                  />
                </h2>

                <div className="mt-20 flex flex-col gap-y-3">
                  <KioskButton
                    className="w-full bg-[#2E3D3B] text-white border-3 border-[#2E3D3B] text-2xl font-bold px-10 py-2 rounded-2xl flex items-center justify-center"
                    onActivate={onContinue}
                  >
                    Ship another parcel now{' '}
                    <img src={send} alt="Send Icon" className="inline-block h-auto ms-3" />
                  </KioskButton>
                  <KioskButton
                    className="w-full bg-white text-[#3A6680] border-3 border-[#3A6680] text-2xl font-bold px-10 py-2 rounded-2xl flex items-center justify-center"
                    onActivate={onClose}
                  >
                    <span className="leading-[50px]">Close ({timeRemaining})</span>
                  </KioskButton>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Complete
