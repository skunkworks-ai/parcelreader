import { useEffect, useRef } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import axios from 'axios'
import i18n from 'i18next'
import { initReactI18next, Trans } from 'react-i18next'
import { v4 as uuidv4 } from 'uuid'

import { TapSound } from '@renderer/components/TapSound/TapSound'
import { RootState } from '@renderer/store'
import { setCurrentOrder, addOrder, setCurrentItem } from '@renderer/features/orders/ordersSlice'
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
  const casPD2AddressURL = useSelector((state: RootState) => state.config.casPD2AddressURL)
  const parcels = useSelector((state: RootState) => state.config.parcels)
  const lastWeightRef = useRef<number | null>(null)
  const pollingIntervalRef = useRef<NodeJS.Timeout | null>(null)
  const dispatch = useDispatch()

  const onStart = () => {
    const id = uuidv4()

    const item = {
      id: uuidv4()
    }

    const newOrder = {
      id,
      date_created: new Date().toISOString(),
      items: [item]
    }

    // Add the order and set as current, and set the current item
    dispatch(addOrder(newOrder))
    dispatch(setCurrentOrder(newOrder))
    dispatch(setCurrentItem(item))

    // Navigate to parcel detection
    location.hash = `#/parceldetection?state=${encodeURIComponent(JSON.stringify({ tapped: true }))}`
  }

  useEffect(() => {
    // Poll casPD2AddressURL every 2 seconds
    const pollWeight = async () => {
      try {
        const response = await axios.get(casPD2AddressURL)
        const currentWeight = response.data?.data?.weight || 0
        // const parcel = getParcelByWeight(currentWeight, parcels)
        console.log(response?.data)

        if (currentWeight !== undefined && currentWeight !== null && currentWeight !== 0) {
          // Check if weight has changed
          if (lastWeightRef.current !== null && lastWeightRef.current !== currentWeight) {
            // Weight changed — create a new current order with a random id and navigate
            const id = uuidv4()

            const item = {
              id: uuidv4(),
              parcelWeight: currentWeight
            }

            const newOrder = {
              id,
              date_created: new Date().toISOString(),
              items: [item]
            }

            // Add the order and set as current, and set the current item
            dispatch(addOrder(newOrder))
            dispatch(setCurrentOrder(newOrder))
            dispatch(setCurrentItem(item))

            // Navigate to parcel detection
            location.hash = '#/parceldetection'
          }
          // Update the last known weight
          lastWeightRef.current = currentWeight
        } else {
          lastWeightRef.current = currentWeight
        }
      } catch (error) {
        console.error('Failed to poll casPD2AddressURL:', error)
      }
    }

    // Start polling on component mount
    pollingIntervalRef.current = setInterval(pollWeight, 1000)

    // Cleanup on unmount
    return () => {
      if (pollingIntervalRef.current) {
        clearInterval(pollingIntervalRef.current)
      }
    }
  }, [casPD2AddressURL, dispatch, parcels])

  useEffect(() => {
    // Clear any existing order/item when the attract loop starts
    dispatch(setCurrentOrder(null))
    dispatch(setCurrentItem(null))
  })

  return (
    <TapSound>
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
    </TapSound>
  )
}

export default AttractLoop
