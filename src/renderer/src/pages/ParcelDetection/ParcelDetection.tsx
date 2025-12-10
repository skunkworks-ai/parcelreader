import { useEffect, useState } from 'react'
import i18n from 'i18next'
import { initReactI18next, Trans } from 'react-i18next'

import KioskButton from '@renderer/components/KioskButton/KioskButton'
import { sleep } from '@renderer/utils/utils'
import logo from './logo.svg'
import bg from '@renderer/assets/bg.png'
import loader from './loader.svg'
import './ParcelDetection.css'

const MESSAGES = {
  PARCELDETECTION_WAITDETECT_MESSAGE: 'Please wait as we detect your parcel.',
  PARCELDETECTION_DETECTING_STATUS: 'Detecting...',
  PARCELDETECTION_DETECTFAIL_MESSAGE:
    '<main>Oops!</main> We can’t seem to see the parcel!<sub>Can you try moving it or repositioning it?</sub>',
  PARCELDETECTION_DETECTFAIL_STATUS: 'Detecting...',
  PARCELDETECTION_ASSESS_MESSAGE:
    '<main>Nice, we see it!</main> Please wait as we assess your parcel...',
  PARCELDETECTION_DETERMINEWEIGHT_STATUS: 'Determining Weight...'
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

const PARCELDETECTIONSTATUSES = {
  DETECTING: 'DETECTING',
  DETECT_FAIL: 'DETECT_FAIL',
  DETECT_SUCCESS: 'DETECT_SUCCESS'
}

function ParcelDetection(): React.JSX.Element {
  const [parcelDetectionStatus, setParcelDetectionStatus] = useState(
    PARCELDETECTIONSTATUSES.DETECTING
  )
  const [parcelSize, setParcelSize] = useState<string | null>('')
  const [parcelWeight, setParcelWeight] = useState<number | null>(0)

  const onCancel = () => {
    location.hash = '#/attractloop'
  }

  const simulateDetection = async () => {
    await sleep(5000)
    setParcelDetectionStatus(PARCELDETECTIONSTATUSES.DETECT_FAIL)
    await sleep(5000)
    setParcelDetectionStatus(PARCELDETECTIONSTATUSES.DETECT_SUCCESS)
    await sleep(1000)
    setParcelSize('Medium Box')
    await sleep(3000)
    setParcelWeight(1.75)
  }

  useEffect(() => {
    simulateDetection()
  }, [])

  const onContinue = async () => {
    await sleep(200)
    location.hash = '#/parcelinformation'
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
            <div>
              <KioskButton
                className="bg-white text-[#3A6680] border-3 border-[#3A6680] text-xl font-bold px-15 py-3 rounded-2xl"
                onActivate={onCancel}
              >
                Cancel
              </KioskButton>
            </div>
          </div>

          <div className="flex justify-center flex-col items-center">
            <div className="rounded-3xl bg-black w-[750px] h-[500px] shadow-2xl z-1"></div>

            <div>
              {parcelDetectionStatus === PARCELDETECTIONSTATUSES.DETECTING && (
                <h1 className="w-[500px] text-center text-[3rem]/[3rem] font-bold text-black my-10">
                  <Trans
                    i18n={localI18n}
                    i18nKey="PARCELDETECTION_WAITDETECT_MESSAGE"
                    components={{
                      main: <span className="text-[#fa5f4e] block" />,
                      sub: <span className="mt-10 text-[2rem]/[2rem] block" />
                    }}
                  />
                </h1>
              )}
              {parcelDetectionStatus === PARCELDETECTIONSTATUSES.DETECT_FAIL && (
                <h1 className="w-[500px] text-center text-[3rem]/[3rem] font-bold text-black my-10">
                  <Trans
                    i18n={localI18n}
                    i18nKey="PARCELDETECTION_DETECTFAIL_MESSAGE"
                    components={{
                      main: <span className="text-[#fa5f4e] block" />,
                      sub: <span className="mt-10 text-[2rem]/[2rem] block" />
                    }}
                  />
                </h1>
              )}
              {parcelDetectionStatus === PARCELDETECTIONSTATUSES.DETECT_SUCCESS && (
                <div className="w-[650px] bg-white rounded-b-3xl p-10 text-black">
                  <h1 className="w-[480px] text-[2.4rem]/[2.4rem] font-bold text-black mb-10">
                    <Trans
                      i18n={localI18n}
                      i18nKey="PARCELDETECTION_ASSESS_MESSAGE"
                      components={{
                        main: <span className="text-[#fa5f4e] block" />,
                        sub: <span className="mt-10 text-[2rem]/[2rem] block" />
                      }}
                    />
                  </h1>

                  <div>
                    <div className="parent-container mb-15">
                      <ul className="list-none divide-y divide-gray-300">
                        <li className="flex text-2xl py-3">
                          <div className="flex-[0_0_50px]">{parcelSize ? '✅' : ''}</div>
                          <div className="flex-1 uppercase text-gray-600">Parcel Size</div>
                          <div className="flex-1 uppercase font-bold">{parcelSize}</div>
                        </li>
                        <li className="flex text-2xl py-3">
                          <div className="flex-[0_0_50px]">{parcelWeight ? '✅' : ''}</div>
                          <div className="flex-1 uppercase text-gray-600">Parcel Weight</div>
                          <div className="flex-1 font-bold">
                            {parcelWeight ? `${parcelWeight}kg` : ''}
                          </div>
                        </li>
                      </ul>
                    </div>
                    <div className="flex justify-end">
                      <KioskButton
                        className="bg-[#2E3D3B] text-white border-3 border-[#2E3D3B] text-2xl font-bold px-15 py-3 rounded-2xl uppercase"
                        onActivate={onContinue}
                        disabled={!parcelSize || !parcelWeight}
                      >
                        Next →
                      </KioskButton>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="h-auto flex flex-col justify-end items-center">
          {parcelDetectionStatus === PARCELDETECTIONSTATUSES.DETECTING && (
            <>
              <img
                src={loader}
                alt="Loading Indicator"
                className="w-[50px] h-auto mx-auto animate-spin"
              />
              <h1 className="w-full text-center text-[1.5rem]/[1.5rem] text-black mt-5">
                <Trans i18n={localI18n} i18nKey="PARCELDETECTION_DETECTING_STATUS" />
              </h1>
            </>
          )}
          {parcelDetectionStatus === PARCELDETECTIONSTATUSES.DETECT_FAIL && (
            <>
              <img
                src={loader}
                alt="Loading Indicator"
                className="w-[50px] h-auto mx-auto animate-spin"
              />
              <h1 className="w-full text-center text-[1.5rem]/[1.5rem] text-black mt-5">
                <Trans i18n={localI18n} i18nKey="PARCELDETECTION_DETECTING_STATUS" />
              </h1>
            </>
          )}
          {parcelDetectionStatus === PARCELDETECTIONSTATUSES.DETECT_SUCCESS && !parcelWeight && (
            <>
              <img
                src={loader}
                alt="Loading Indicator"
                className="w-[50px] h-auto mx-auto animate-spin"
              />
              <h1 className="w-full text-center text-[1.5rem]/[1.5rem] text-black mt-5">
                <Trans i18n={localI18n} i18nKey="PARCELDETECTION_DETERMINEWEIGHT_STATUS" />
              </h1>
            </>
          )}
        </div>
      </div>
    </div>
  )
}

export default ParcelDetection
