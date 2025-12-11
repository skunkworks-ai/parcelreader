import { useState } from 'react'
import i18n from 'i18next'
import { initReactI18next, Trans } from 'react-i18next'
import { useSelector, useDispatch } from 'react-redux'
import { v4 as uuidv4 } from 'uuid'

import KioskButton from '@renderer/components/KioskButton/KioskButton'
import ControlledInput from '@renderer/contexts/KeyboardProvider/ControlledInput'
import { RootState } from '@renderer/store'
import { setCurrentItem } from '@renderer/features/orders/ordersSlice'
import { sleep } from '@renderer/utils/utils'
import logo from './logo.svg'
import bg from '@renderer/assets/bg.png'
import parcelIcon from './parcelIcon.svg'
import receiveIcon from './receiveIcon.svg'
import box from './box.svg'
import loader from './loader.svg'
import next from './next.svg'
import send from './send.svg'
import './ParcelInformation.css'

const MESSAGES = {
  PARCELINFORMATION_SENDERDETAILS_TITLE: 'Parcel Sender Details',
  PARCELINFORMATION_SENDERDETAILS_MESSAGE:
    '<main>Perfect, we’re just about ready to ship.</main>Please share your details with us.',
  PARCELINFORMATION_RECIPIENTDETAILS_TITLE: 'Parcel Recipient Details',
  PARCELINFORMATION_RECIPIENTDETAILS_MESSAGE:
    "<main>Nice. Who should we send the parcel to?</main>Please share the recipient's details with us.",
  PARCELINFORMATION_CONFIRMING_STATUS: 'Confirming Information...'
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

const PARCELINFORMATIONSTATUSES = {
  SENDER_DETAILS: 'SENDER_DETAILS',
  RECIPIENT_DETAILS: 'RECIPIENT_DETAILS',
  CONFIRMING: 'CONFIRMING'
}

function ParcelInformation(): React.JSX.Element {
  const [parcelInformationStatus, setParcelInformationStatus] = useState(
    PARCELINFORMATIONSTATUSES.SENDER_DETAILS
  )
  const [senderDetailsLastName, setSenderDetailsLastName] = useState('')
  const [senderDetailsFirstName, setSenderDetailsFirstName] = useState('')
  const [senderDetailsMiddleName, setSenderDetailsMiddleName] = useState('')
  const [senderDetailsEmailAddress, setSenderDetailsEmailAddress] = useState('')
  const [senderDetailsContactNumber, setSenderDetailsContactNumber] = useState('')
  const [senderDetailsStreet, setSenderDetailsStreet] = useState('')
  const [senderDetailsCity, setSenderDetailsCity] = useState('')
  const [senderDetailsState, setSenderDetailsState] = useState('')
  const [senderDetailsZIPCode, setSenderDetailsZIPCode] = useState('')
  const [senderDetailsCountry, setSenderDetailsCountry] = useState('')

  const [recipientDetailsLastName, setRecipientDetailsLastName] = useState('')
  const [recipientDetailsFirstName, setRecipientDetailsFirstName] = useState('')
  const [recipientDetailsMiddleName, setRecipientDetailsMiddleName] = useState('')
  const [recipientDetailsEmailAddress, setRecipientDetailsEmailAddress] = useState('')
  const [recipientDetailsContactNumber, setRecipientDetailsContactNumber] = useState('')
  const [recipientDetailsStreet, setRecipientDetailsStreet] = useState('')
  const [recipientDetailsCity, setRecipientDetailsCity] = useState('')
  const [recipientDetailsState, setRecipientDetailsState] = useState('')
  const [recipientDetailsZIPCode, setRecipientDetailsZIPCode] = useState('')
  const [recipientDetailsCountry, setRecipientDetailsCountry] = useState('')

  const currentItem = useSelector((state: RootState) => state.orders.currentItem)
  const dispatch = useDispatch()

  const onCancel = () => {
    history.back()
  }

  const onBack = () => {
    setParcelInformationStatus(PARCELINFORMATIONSTATUSES.SENDER_DETAILS)
  }
  const onNext = () => {
    setParcelInformationStatus(PARCELINFORMATIONSTATUSES.RECIPIENT_DETAILS)
  }
  const onConfirm = async () => {
    setParcelInformationStatus(PARCELINFORMATIONSTATUSES.CONFIRMING)

    // use existing currentItem if available, otherwise create one
    if (currentItem) {
      const updatedItem = {
        ...currentItem,
        senderDetailsLastName,
        senderDetailsFirstName,
        senderDetailsMiddleName,
        senderDetailsEmailAddress,
        senderDetailsContactNumber,
        senderDetailsStreet,
        senderDetailsCity,
        senderDetailsState,
        senderDetailsZIPCode,
        senderDetailsCountry,
        recipientDetailsLastName,
        recipientDetailsFirstName,
        recipientDetailsMiddleName,
        recipientDetailsEmailAddress,
        recipientDetailsContactNumber,
        recipientDetailsStreet,
        recipientDetailsCity,
        recipientDetailsState,
        recipientDetailsZIPCode,
        recipientDetailsCountry
      }

      dispatch(setCurrentItem(updatedItem))
    } else {
      const item = {
        id: uuidv4(),
        senderDetailsLastName,
        senderDetailsFirstName,
        senderDetailsMiddleName,
        senderDetailsEmailAddress,
        senderDetailsContactNumber,
        senderDetailsStreet,
        senderDetailsCity,
        senderDetailsState,
        senderDetailsZIPCode,
        senderDetailsCountry,
        recipientDetailsLastName,
        recipientDetailsFirstName,
        recipientDetailsMiddleName,
        recipientDetailsEmailAddress,
        recipientDetailsContactNumber,
        recipientDetailsStreet,
        recipientDetailsCity,
        recipientDetailsState,
        recipientDetailsZIPCode,
        recipientDetailsCountry
      }

      dispatch(setCurrentItem(item))
    }

    await sleep(3000)
    location.hash = '#/complete'
  }

  return (
    <div
      id="parcel-information-page"
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
                className="bg-white text-[#3A6680] border-3 border-[#3A6680] text-xl font-bold px-10 py-2 rounded-2xl"
                onActivate={onCancel}
              >
                Cancel
              </KioskButton>
            </div>
          </div>

          <div className="flex justify-center flex-col items-center">
            <div className="relative w-[750px] h-[500px] z-1 flex flex-col justify-end">
              <img src={box} alt="Parcel Box" className="w-[750px] h-auto mx-auto" />
              <div className="absolute top-35 left-10 text-white uppercase font-bold text-2xl">
                {currentItem?.parcelSize}
              </div>
              <div className="absolute bottom-10 right-10 text-white font-bold text-5xl">
                {currentItem?.parcelWeight}kg
              </div>
            </div>

            <div>
              <div className="w-[900px] bg-white rounded-3xl p-10 pt-30 -mt-20 text-black">
                {parcelInformationStatus === PARCELINFORMATIONSTATUSES.SENDER_DETAILS && (
                  <>
                    <h1 className="w-full text-[1.5rem]/[1.5rem] font-bold uppercase text-[#2E3D3B] mb-5">
                      <img
                        src={parcelIcon}
                        alt="Parcel Icon"
                        className="inline-block w-14 h-auto me-3"
                      />
                      <Trans i18n={localI18n} i18nKey="PARCELINFORMATION_SENDERDETAILS_TITLE" />
                    </h1>
                    <h1 className="w-full text-[2.4rem]/[2.4rem] font-bold text-black mb-10">
                      <Trans
                        i18n={localI18n}
                        i18nKey="PARCELINFORMATION_SENDERDETAILS_MESSAGE"
                        components={{
                          main: <span className="text-[#fa5f4e] block" />
                        }}
                      />
                    </h1>
                    <form>
                      <div className="flex gap-5 mb-5">
                        <div className="flex-1">
                          <label className="uppercase mb-2 block text-gray-400">Last Name</label>
                          <ControlledInput
                            value={senderDetailsLastName}
                            setValue={setSenderDetailsLastName}
                          />
                        </div>
                        <div className="flex-1">
                          <label className="uppercase mb-2 block text-gray-400">First Name</label>
                          <ControlledInput
                            value={senderDetailsFirstName}
                            setValue={setSenderDetailsFirstName}
                          />
                        </div>
                        <div className="flex-1">
                          <label className="uppercase mb-2 block text-gray-400">Middle Name</label>
                          <ControlledInput
                            value={senderDetailsMiddleName}
                            setValue={setSenderDetailsMiddleName}
                          />
                        </div>
                      </div>
                      <div className="flex gap-5 mb-5">
                        <div className="flex-1">
                          <label className="uppercase mb-2 block text-gray-400">
                            Email Address
                          </label>
                          <ControlledInput
                            value={senderDetailsEmailAddress}
                            setValue={setSenderDetailsEmailAddress}
                          />
                        </div>
                        <div className="flex-1">
                          <label className="uppercase mb-2 block text-gray-400">
                            Contact Number
                          </label>
                          <ControlledInput
                            value={senderDetailsContactNumber}
                            setValue={setSenderDetailsContactNumber}
                          />
                        </div>
                      </div>

                      <hr className="border-gray-400 my-5" />

                      <div className="flex gap-5 mb-5">
                        <div className="flex-3">
                          <label className="uppercase mb-2 block text-gray-400">Street</label>
                          <ControlledInput
                            value={senderDetailsStreet}
                            setValue={setSenderDetailsStreet}
                          />
                        </div>
                        <div className="flex-2">
                          <label className="uppercase mb-2 block text-gray-400">City</label>
                          <ControlledInput
                            value={senderDetailsCity}
                            setValue={setSenderDetailsCity}
                          />
                        </div>
                      </div>
                      <div className="flex gap-5 mb-5">
                        <div className="flex-1">
                          <label className="uppercase mb-2 block text-gray-400">State</label>
                          <ControlledInput
                            value={senderDetailsState}
                            setValue={setSenderDetailsState}
                          />
                        </div>
                        <div className="flex-1">
                          <label className="uppercase mb-2 block text-gray-400">ZIP Code</label>
                          <ControlledInput
                            value={senderDetailsZIPCode}
                            setValue={setSenderDetailsZIPCode}
                          />
                        </div>
                        <div className="flex-1">
                          <label className="uppercase mb-2 block text-gray-400">Country</label>
                          <ControlledInput
                            value={senderDetailsCountry}
                            setValue={setSenderDetailsCountry}
                          />
                        </div>
                      </div>
                    </form>
                  </>
                )}

                {(parcelInformationStatus === PARCELINFORMATIONSTATUSES.RECIPIENT_DETAILS ||
                  parcelInformationStatus === PARCELINFORMATIONSTATUSES.CONFIRMING) && (
                  <>
                    <h1 className="w-full text-[1.5rem]/[1.5rem] font-bold uppercase text-[#2E3D3B] mb-5">
                      <img
                        src={receiveIcon}
                        alt="Parcel Icon"
                        className="inline-block w-14 h-auto me-3"
                      />
                      <Trans i18n={localI18n} i18nKey="PARCELINFORMATION_RECIPIENTDETAILS_TITLE" />
                    </h1>
                    <h1 className="w-full text-[2.4rem]/[2.4rem] font-bold text-black mb-10">
                      <Trans
                        i18n={localI18n}
                        i18nKey="PARCELINFORMATION_RECIPIENTDETAILS_MESSAGE"
                        components={{
                          main: <span className="text-[#fa5f4e] block" />
                        }}
                      />
                    </h1>
                    <form>
                      <div className="flex gap-5 mb-5">
                        <div className="flex-1">
                          <label className="uppercase mb-2 block text-gray-400">Last Name</label>
                          <ControlledInput
                            value={recipientDetailsLastName}
                            setValue={setRecipientDetailsLastName}
                          />
                        </div>
                        <div className="flex-1">
                          <label className="uppercase mb-2 block text-gray-400">First Name</label>
                          <ControlledInput
                            value={recipientDetailsFirstName}
                            setValue={setRecipientDetailsFirstName}
                          />
                        </div>
                        <div className="flex-1">
                          <label className="uppercase mb-2 block text-gray-400">Middle Name</label>
                          <ControlledInput
                            value={recipientDetailsMiddleName}
                            setValue={setRecipientDetailsMiddleName}
                          />
                        </div>
                      </div>
                      <div className="flex gap-5 mb-5">
                        <div className="flex-1">
                          <label className="uppercase mb-2 block text-gray-400">
                            Email Address
                          </label>
                          <ControlledInput
                            value={recipientDetailsEmailAddress}
                            setValue={setRecipientDetailsEmailAddress}
                          />
                        </div>
                        <div className="flex-1">
                          <label className="uppercase mb-2 block text-gray-400">
                            Contact Number
                          </label>
                          <ControlledInput
                            value={recipientDetailsContactNumber}
                            setValue={setRecipientDetailsContactNumber}
                          />
                        </div>
                      </div>

                      <hr className="border-gray-400 my-5" />

                      <div className="flex gap-5 mb-5">
                        <div className="flex-3">
                          <label className="uppercase mb-2 block text-gray-400">Street</label>
                          <ControlledInput
                            value={recipientDetailsStreet}
                            setValue={setRecipientDetailsStreet}
                          />
                        </div>
                        <div className="flex-2">
                          <label className="uppercase mb-2 block text-gray-400">City</label>
                          <ControlledInput
                            value={recipientDetailsCity}
                            setValue={setRecipientDetailsCity}
                          />
                        </div>
                      </div>
                      <div className="flex gap-5 mb-5">
                        <div className="flex-1">
                          <label className="uppercase mb-2 block text-gray-400">State</label>
                          <ControlledInput
                            value={recipientDetailsState}
                            setValue={setRecipientDetailsState}
                          />
                        </div>
                        <div className="flex-1">
                          <label className="uppercase mb-2 block text-gray-400">ZIP Code</label>
                          <ControlledInput
                            value={recipientDetailsZIPCode}
                            setValue={setRecipientDetailsZIPCode}
                          />
                        </div>
                        <div className="flex-1">
                          <label className="uppercase mb-2 block text-gray-400">Country</label>
                          <ControlledInput
                            value={recipientDetailsCountry}
                            setValue={setRecipientDetailsCountry}
                          />
                        </div>
                      </div>
                    </form>
                  </>
                )}

                <div>
                  <div className="parent-container mb-15"></div>
                  <div className="flex justify-end">
                    {parcelInformationStatus === PARCELINFORMATIONSTATUSES.SENDER_DETAILS && (
                      <KioskButton
                        className="bg-[#2E3D3B] text-white border-3 border-[#2E3D3B] text-2xl font-bold px-10 py-2 rounded-2xl flex items-center justify-center"
                        onActivate={onNext}
                      >
                        Next <img src={next} alt="Next Icon" className="inline-block h-auto ms-3" />
                      </KioskButton>
                    )}
                    {(parcelInformationStatus === PARCELINFORMATIONSTATUSES.RECIPIENT_DETAILS || parcelInformationStatus === PARCELINFORMATIONSTATUSES.CONFIRMING) && (
                      <>
                        <KioskButton
                          className="bg-gray-100 text-[#2E3D3B] border-3 border-gray-100 text-2xl font-bold px-10 py-2 rounded-2xl me-5"
                          onActivate={onBack}
                          disabled={
                            parcelInformationStatus === PARCELINFORMATIONSTATUSES.CONFIRMING
                          }
                        >
                          Back
                        </KioskButton>
                        <KioskButton
                          className="bg-[#2E3D3B] text-white border-3 border-[#2E3D3B] text-2xl font-bold px-10 py-2 rounded-2xl flex items-center justify-center"
                          onActivate={onConfirm}
                          disabled={
                            parcelInformationStatus === PARCELINFORMATIONSTATUSES.CONFIRMING
                          }
                        >
                          Confirm Info{' '}
                          <img src={send} alt="Send Icon" className="inline-block h-auto ms-3" />
                        </KioskButton>
                      </>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="h-auto flex flex-col justify-end items-center">
          {parcelInformationStatus === PARCELINFORMATIONSTATUSES.CONFIRMING && (
            <>
              <img
                src={loader}
                alt="Loading Indicator"
                className="w-[50px] h-auto mx-auto animate-spin"
              />
              <h1 className="w-full text-center text-[1.5rem]/[1.5rem] text-black mt-5">
                <Trans i18n={localI18n} i18nKey="PARCELINFORMATION_CONFIRMING_STATUS" />
              </h1>
            </>
          )}
        </div>
      </div>
    </div>
  )
}

export default ParcelInformation
