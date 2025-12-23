import { useEffect, useState, useRef, useCallback } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import axios from 'axios'
import i18n from 'i18next'
import { initReactI18next, Trans } from 'react-i18next'
import { v4 as uuidv4 } from 'uuid'

import KioskButton from '@renderer/components/KioskButton/KioskButton'
import {
  fileToBase64,
  getParcelByWeight,
  sleep,
  getBaseImageFileFromStream
} from '@renderer/utils/utils'
import { RootState } from '@renderer/store'
import { setCurrentItem } from '@renderer/features/orders/ordersSlice'
import logo from './logo.svg'
import bg from '@renderer/assets/bg.png'
import loader from './loader.svg'
import next from './next.svg'
// import sampleEmpty from './empty.jpg'
import sampleNotEmpty from './not_empty.jpg'
import './ParcelDetection.css'

const MESSAGES = {
  PARCELDETECTION_WAITDETECT_MESSAGE: 'Please wait as we detect your parcel.',
  PARCELDETECTION_DETECTING_STATUS: 'Detecting...',
  PARCELDETECTION_DETECTFAIL_MESSAGE:
    '<main>Oops!</main> We can’t seem to see the parcel!<sub>Can you try moving it or repositioning it?</sub>',
  PARCELDETECTION_DETECTFAIL_STATUS: 'Detecting...',
  PARCELDETECTION_ASSESS_MESSAGE:
    '<main>Nice, we see it!</main> Please wait as we assess your parcel...',
  PARCELDETECTION_DETERMINEWEIGHT_STATUS: 'Determining Weight...',
  PARCELDETECTION_WAITING_WARNING: 'Still waiting for a parcel 😊',
  PARCELDETECTION_WAITING_WARNING_DESC:
    'Place it on the platform, or we’ll return to the home screen in <b>{{seconds}}</b> seconds.',
  PARCELDETECTION_CONTINUE_SCANNING: 'Continue scanning',
  PARCELDETECTION_CANCEL: 'Cancel',
  PARCELDETECTION_PARCEL_SIZE: 'Parcel Size',
  PARCELDETECTION_PARCEL_WEIGHT: 'Parcel Weight',
  PARCELDETECTION_CHECK_IS_BOX: 'Check is_box'
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

const NO_WEIGHT_TIMEOUT_MS = 60000 // 60 seconds
const NO_WEIGHT_TIMEOUTWARNING_S = 10 // 10 seconds

function ParcelDetection(): React.JSX.Element {
  const casPD2AddressURL = useSelector((state: RootState) => state.config.casPD2AddressURL)
  const realSenseAddressURL = useSelector((state: RootState) => state.config.realSenseAddressURL)
  const parcels = useSelector((state: RootState) => state.config.parcels)
  const detectParcelURL = useSelector((state: RootState) => state.config.detectParcelURL)
  const detectParcelLocalURL = useSelector((state: RootState) => state.config.detectParcelLocalURL)
  const unit = useSelector((state: RootState) => state.config.unit)
  const [parcelDetectionStatus, setParcelDetectionStatus] = useState(
    PARCELDETECTIONSTATUSES.DETECTING
  )
  const [parcelSize, setParcelSize] = useState<string | null>('')
  const [parcelWeight, setParcelWeight] = useState<number | null>(0)
  const lastWeightRef = useRef<number | null>(null)
  const pollingIntervalRef = useRef<NodeJS.Timeout | null>(null)
  const timeoutRef = useRef<NodeJS.Timeout | null>(null)
  const noWeightChangeTimeoutRef = useRef<NodeJS.Timeout | null>(null)
  const weightDetectedRef = useRef(false)
  const tapsRef = useRef(0)
  const tapResetRef = useRef<NodeJS.Timeout | null>(null)
  const dispatch = useDispatch()
  const currentItem = useSelector((state: RootState) => state.orders.currentItem)
  // const [preview, setPreview] = useState<string | null>(null)
  const [showPreview, setShowPreview] = useState(false)
  const [noWeightTimeoutWarning, setNoWeightTimeoutWarning] = useState(false)
  const [noWeightTimeoutSecondsLeft, setNoWeightTimeoutSecondsLeft] = useState(
    NO_WEIGHT_TIMEOUT_MS / 1000
  )

  // Show preview after 500ms on mount
  // --- Timer interval ref for warning countdown ---
  const noWeightIntervalRef = useRef<NodeJS.Timeout | null>(null)

  // Handler to reset the 30s timeout and warning
  const handleResetNoWeightTimeout = () => {
    if (noWeightChangeTimeoutRef.current) {
      clearTimeout(noWeightChangeTimeoutRef.current)
    }
    if (noWeightIntervalRef.current) {
      clearInterval(noWeightIntervalRef.current)
    }
    setNoWeightTimeoutWarning(false)
    setNoWeightTimeoutSecondsLeft(NO_WEIGHT_TIMEOUT_MS / 1000)
    noWeightIntervalRef.current = setInterval(() => {
      setNoWeightTimeoutSecondsLeft((prev) => {
        if (prev <= NO_WEIGHT_TIMEOUTWARNING_S) {
          setNoWeightTimeoutWarning(true)
        } else {
          setNoWeightTimeoutWarning(false)
        }
        if (prev <= 1) {
          if (noWeightIntervalRef.current) clearInterval(noWeightIntervalRef.current)
        }
        console.log('No weight timeout seconds left:', prev - 1)
        return prev - 1
      })
    }, 1000)
    noWeightChangeTimeoutRef.current = setTimeout(() => {
      setNoWeightTimeoutWarning(false)
      location.hash = 'attractloop'
    }, NO_WEIGHT_TIMEOUT_MS)
  }

  useEffect(() => {
    const timer = setTimeout(() => setShowPreview(true), 500)
    return () => clearTimeout(timer)
  }, [])

  const onCancel = () => {
    location.hash = 'attractloop'
  }

  const handleRefreshPreview = () => {
    window.location.reload()
  }

  // Parcel Detection
  const uploadBase64Image = useCallback(
    async (file?: File): Promise<any> => {
      // Fallback to sampleEmpty if no file is provided
      const fileToUse = file || sampleNotEmpty
      let base64Image
      if (fileToUse instanceof File) {
        base64Image = await fileToBase64(fileToUse)
      } else {
        // sampleEmpty is an imported image path, fetch and convert to base64
        const response = await fetch(fileToUse)
        const blob = await response.blob()
        base64Image = await fileToBase64(blob as any)
      }

      const formData = new FormData()
      formData.append('image_base64', base64Image)

      return axios.post(detectParcelURL, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
          'Sali-Apikey': 'cEHuVyMUGDONEUf3'
        }
      })
    },
    [detectParcelURL]
  )

  useEffect(() => {
    let isComponentMounted = true
    weightDetectedRef.current = false
    lastWeightRef.current = null

    // Get if tapped from /attractloop
    let state = { tapped: false }
    const hash = location.hash
    const params = new URLSearchParams(hash.split('?')[1])
    const stateStr = params.get('state')
    if (stateStr) {
      state = JSON.parse(decodeURIComponent(stateStr))
    }

    // Initialize the no-weight timeout mechanism
    handleResetNoWeightTimeout()

    const pollWeight = async () => {
      try {
        const response = await axios.get(casPD2AddressURL)
        const currentWeightRaw = response.data?.data?.weight || 0
        // Ceil to 1 decimal place
        const currentWeight = Math.ceil(currentWeightRaw * 10) / 10
        const parcel = getParcelByWeight(currentWeightRaw, parcels)
        console.log('Polled Weight Raw:', currentWeightRaw, 'Ceiled Weight:', currentWeight)

        if (
          isComponentMounted &&
          currentWeight !== undefined &&
          currentWeight !== null &&
          currentWeight !== 0
        ) {
          // Check if tapped from /attractloop
          if (state.tapped) {
            // Check if weight has changed
            if (lastWeightRef.current !== null && lastWeightRef.current !== currentWeight) {
              // Reset the 30s no weight change timeout on weight change
              handleResetNoWeightTimeout()

              // Weight changed, upload base image and check is_box before success
              if (!weightDetectedRef.current) {
                try {
                  // Get a frame from the stream URL as a File

                  // let baseImageFile: File | null = await getBaseImageFileFromStream(realSenseAddressURL)
                  // const uploadRes = await uploadBase64Image(baseImageFile)
                  // baseImageFile = null

                  const uploadRes = await axios(detectParcelLocalURL)

                  console.log('is_box:', uploadRes.data?.is_box)

                  if (uploadRes.data && uploadRes.data.is_box) {
                    weightDetectedRef.current = true
                    setParcelDetectionStatus(PARCELDETECTIONSTATUSES.DETECT_SUCCESS)

                    // Clear the no-weight warning interval on success
                    if (noWeightIntervalRef.current) {
                      clearInterval(noWeightIntervalRef.current)
                    }

                    // Clear the 10s timeout since weight was detected
                    if (timeoutRef.current) {
                      clearTimeout(timeoutRef.current)
                    }
                    // Clear the 30s no weight change timeout
                    if (noWeightChangeTimeoutRef.current) {
                      clearTimeout(noWeightChangeTimeoutRef.current)
                    }

                    // Optionally set parcel size and weight data here if available in response
                    if (parcel) {
                      setParcelSize(parcel.name)
                    }
                    if (currentWeightRaw) {
                      setParcelWeight(currentWeightRaw)
                    }
                  } else {
                    // Not a box, treat as detection fail
                    setParcelDetectionStatus(PARCELDETECTIONSTATUSES.DETECT_FAIL)
                  }
                } catch (err) {
                  console.error('Image upload or is_box check failed', err)
                  setParcelDetectionStatus(PARCELDETECTIONSTATUSES.DETECT_FAIL)
                }
              }
            }
            // Update the last known weight
            lastWeightRef.current = currentWeight
          } else {
            try {
              // Get a frame from the stream URL as a File

              // let baseImageFile: File | null = await getBaseImageFileFromStream(realSenseAddressURL)
              // const uploadRes = await uploadBase64Image(baseImageFile)
              // baseImageFile = null

              const uploadRes = await axios(detectParcelLocalURL)

              console.log('is_box:', uploadRes.data?.is_box)

              if (uploadRes.data && uploadRes.data.is_box) {
                weightDetectedRef.current = true
                setParcelDetectionStatus(PARCELDETECTIONSTATUSES.DETECT_SUCCESS)
                // Clear the no-weight warning interval on success
                if (noWeightIntervalRef.current) {
                  clearInterval(noWeightIntervalRef.current)
                }

                // Clear the 10s timeout since weight was detected
                if (timeoutRef.current) {
                  clearTimeout(timeoutRef.current)
                }

                // Optionally set parcel size and weight data here if available in response
                if (parcel) {
                  setParcelSize(parcel.name)
                }
                if (currentWeightRaw) {
                  setParcelWeight(currentWeightRaw)
                }
              } else {
                // Not a box, treat as detection fail
                setParcelDetectionStatus(PARCELDETECTIONSTATUSES.DETECT_FAIL)
              }
            } catch (err) {
              console.error('Image upload or is_box check failed', err)
              setParcelDetectionStatus(PARCELDETECTIONSTATUSES.DETECT_FAIL)
            }
          }
        } else {
          lastWeightRef.current = currentWeight
        }
      } catch (error) {
        console.error('Failed to poll casPD2AddressURL:', error)
      }
    }

    // Start polling on component mount
    pollingIntervalRef.current = setInterval(pollWeight, 1000)

    // Set 10s timeout to fail detection if no weight change
    timeoutRef.current = setTimeout(() => {
      if (isComponentMounted && !weightDetectedRef.current) {
        setParcelDetectionStatus(PARCELDETECTIONSTATUSES.DETECT_FAIL)
      }
    }, 10000)

    // Cleanup on unmount
    return () => {
      isComponentMounted = false
      if (pollingIntervalRef.current) {
        clearInterval(pollingIntervalRef.current)
      }
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
      }
      if (noWeightChangeTimeoutRef.current) {
        clearTimeout(noWeightChangeTimeoutRef.current)
      }

      if (noWeightIntervalRef.current) {
        clearInterval(noWeightIntervalRef.current)
      }
    }
  }, [casPD2AddressURL, detectParcelLocalURL, parcels, realSenseAddressURL, uploadBase64Image])

  // Simulate
  const handleTap = () => {
    console.log('Tapped parcel detection screen')
    // Increment tap counter and reset after 1.5s of inactivity
    tapsRef.current += 1

    if (tapResetRef.current) {
      clearTimeout(tapResetRef.current)
    }

    tapResetRef.current = setTimeout(() => {
      tapsRef.current = 0
      tapResetRef.current = null
    }, 1500)

    // If user tapped 5 times quickly, emulate detection
    if (tapsRef.current >= 5) {
      tapsRef.current = 0
      if (tapResetRef.current) {
        clearTimeout(tapResetRef.current)
        tapResetRef.current = null
      }

      // Emulated parcel data
      const emulatedWeight = 0.8
      // const emulatedSize = 'Small Box'

      const parcel = getParcelByWeight(emulatedWeight, parcels)
      console.log(parcel, parcels)

      if (parcel) {
        setParcelWeight(emulatedWeight)
        setParcelSize(parcel.name)
        weightDetectedRef.current = true
        lastWeightRef.current = emulatedWeight
        setParcelDetectionStatus(PARCELDETECTIONSTATUSES.DETECT_SUCCESS)
        // Clear the no-weight warning interval on success
        if (noWeightIntervalRef.current) {
          clearInterval(noWeightIntervalRef.current)
        }

        // Clear the detection fail timeout if present
        if (timeoutRef.current) {
          clearTimeout(timeoutRef.current)
          timeoutRef.current = null
        }
      }
    }
  }

  // const handleChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
  //   if (!e.target.files?.[0]) return

  //   const file = e.target.files[0]

  //   // Create preview (data URL)
  //   const reader = new FileReader()
  //   reader.readAsDataURL(file)
  //   reader.onload = () => {
  //     setPreview(reader.result as string)
  //   }

  //   try {
  //     const res = await uploadBase64Image(e.target.files[0])
  //     console.log(res.data)
  //   } catch (err) {
  //     console.error(err)
  //   }
  // }

  const simulateObjectDetection = async () => {
    try {
      // Get a frame from the stream URL as a File
      let baseImageFile: File | null = await getBaseImageFileFromStream(realSenseAddressURL)
      const uploadRes = await uploadBase64Image(baseImageFile)

      console.log('is_box:', uploadRes.data?.is_box)
      baseImageFile = null
    } catch (err) {
      console.error('Image upload or is_box check failed', err)
    }
  }

  const onContinue = async () => {
    // use existing currentItem if available, otherwise create one
    if (currentItem) {
      const updatedItem = {
        ...currentItem,
        parcelWeight: parcelWeight ?? undefined,
        parcelSize: parcelSize ?? undefined
      }

      dispatch(setCurrentItem(updatedItem))
    } else {
      const item = {
        id: uuidv4(),
        parcelWeight: parcelWeight ?? undefined,
        parcelSize: parcelSize ?? undefined
      }

      dispatch(setCurrentItem(item))
    }

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
      onPointerDown={handleTap}
    >
      {/* Timeout warning overlay */}
      {noWeightTimeoutWarning && noWeightTimeoutSecondsLeft > 0 && (
        <div className="absolute w-full h-full top-0 left-0 flex items-center justify-center z-1000 bg-[rgba(0,0,0,0.45)]">
          <div className="bg-white rounded-2xl p-7 shadow text-left w-[550px]">
            <h2 className="font-bold text-4xl text-[#FA5F4E] mb-4">
              <Trans i18n={localI18n} i18nKey="PARCELDETECTION_WAITING_WARNING" />
            </h2>
            <div className="mb-4 text-black text-xl">
              <Trans
                i18n={localI18n}
                i18nKey="PARCELDETECTION_WAITING_WARNING_DESC"
                values={{ seconds: noWeightTimeoutSecondsLeft }}
                components={{ b: <b /> }}
              />
            </div>
            <KioskButton
              className="w-full bg-white text-[#3A6680] border-3 border-[#3A6680] text-2xl font-bold px-10 py-2 rounded-2xl flex items-center justify-center"
              onActivate={handleResetNoWeightTimeout}
            >
              <span className="leading-[50px]">
                <Trans i18n={localI18n} i18nKey="PARCELDETECTION_CONTINUE_SCANNING" />
              </span>
            </KioskButton>
          </div>
        </div>
      )}
      <div className="p-20 w-full flex flex-col justify-between">
        <div>
          <div className="flex justify-between items-center mb-20">
            <div>
              <img src={logo} alt="ParcelPebble Logo" className="w-[180px] h-auto" />
              {/* {state} */}
            </div>
            <div>
              <KioskButton
                className="bg-white text-[#3A6680] border-3 border-[#3A6680] text-xl font-bold px-10 py-2 rounded-2xl"
                onActivate={onCancel}
              >
                <Trans i18n={localI18n} i18nKey="PARCELDETECTION_CANCEL" />
              </KioskButton>
            </div>
          </div>

          <div className="flex justify-center flex-col items-center">
            {/* <input
              type="file"
              accept="image/*"
              className="px-5 py-4 bg-blue-600 mb-5 rounded-2xl text-xl"
              onChange={handleChange}
            />

            {preview ? (
              <img
                src={preview}
                alt="Preview"
                className="rounded-3xl bg-black w-[750px] h-[500px] shadow-2xl z-1 bg-center bg-cover"
              />
            ) : (
              <div
                id="preview"
                className="rounded-3xl bg-black w-[750px] h-[500px] shadow-2xl z-1 bg-center bg-cover"
                style={{ backgroundImage: `url(${realSenseAddressURL})` }}
              ></div>
            )} */}

            <button
              className="px-5 py-4 bg-blue-600 mb-5 rounded-2xl text-xl hidden"
              onClick={simulateObjectDetection}
            >
              <Trans i18n={localI18n} i18nKey="PARCELDETECTION_CHECK_IS_BOX" />
            </button>

            <div style={{ position: 'relative', width: 750, height: 500 }}>
              {/* Refresh button top right over preview */}
              <button
                className="absolute top-[16px] right-[16px] z-10 bg-[rgba(255,255,255,0.85)] border border-gray-300 rounded-full w-[40px] h-[40px] flex items-center justify-center cursor-pointer text-[22px] shadow-[0_2px_8px_rgba(0,0,0,0.08)] text-black"
                title="Refresh Preview"
                onClick={handleRefreshPreview}
              >
                &#x21bb;
              </button>
              {showPreview && realSenseAddressURL && (
                <img
                  id="preview"
                  src={realSenseAddressURL}
                  alt="RealSense Stream Preview"
                  className="rounded-3xl bg-black w-[750px] h-[500px] shadow-2xl z-1 bg-center bg-cover object-cover"
                  style={{ width: 750, height: 500 }}
                />
              )}
            </div>

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
                          <div className="flex-1 uppercase text-gray-600">
                            <Trans i18n={localI18n} i18nKey="PARCELDETECTION_PARCEL_SIZE" />
                          </div>
                          <div className="flex-1 uppercase font-bold">{parcelSize}</div>
                        </li>
                        <li className="flex text-2xl py-3">
                          <div className="flex-[0_0_50px]">{parcelWeight ? '✅' : ''}</div>
                          <div className="flex-1 uppercase text-gray-600">
                            <Trans i18n={localI18n} i18nKey="PARCELDETECTION_PARCEL_WEIGHT" />
                          </div>
                          <div className="flex-1 font-bold">
                            {parcelWeight ? `${parcelWeight}${unit}` : ''}
                          </div>
                        </li>
                      </ul>
                    </div>
                    <div className="flex justify-end">
                      <KioskButton
                        className="bg-[#2E3D3B] text-white border-3 border-[#2E3D3B] text-2xl font-bold px-10 py-2 rounded-2xl flex items-center justify-center"
                        onActivate={onContinue}
                        disabled={!parcelSize || !parcelWeight}
                      >
                        Next <img src={next} alt="Next Icon" className="inline-block h-auto ms-3" />
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
