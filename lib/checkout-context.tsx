'use client'

import { createContext, useContext, useState, ReactNode } from 'react'

export type CheckoutStep = 1 | 2 | 3 | 4

export type DeliveryInfo = {
  firstName: string
  lastName: string
  email: string
  phone: string
  address: string
  city: string
  state: string
  postalCode: string
  country: string
  notes?: string
}

export type DeliveryOption = {
  id: string
  name: string
  basePrice: number
  pricePerKm?: number
  estimatedDays: number
}

export type PaymentInfo = {
  method: 'card' | 'bank_transfer' | 'momo'
}

/** Store pickup vs home delivery — drives payment step & address fields. */
export type FulfillmentType = 'pickup' | 'home'

type CheckoutContextType = {
  currentStep: CheckoutStep
  fulfillmentType: FulfillmentType | null
  deliveryInfo: DeliveryInfo
  selectedDelivery?: DeliveryOption
  paymentInfo: PaymentInfo
  deliveryCost: number
  
  setCurrentStep: (step: CheckoutStep) => void
  setFulfillmentType: (value: FulfillmentType | null) => void
  setDeliveryInfo: (info: Partial<DeliveryInfo>) => void
  setSelectedDelivery: (delivery: DeliveryOption) => void
  setPaymentInfo: (info: Partial<PaymentInfo>) => void
  setDeliveryCost: (cost: number) => void
  reset: () => void
}

const defaultDeliveryInfo: DeliveryInfo = {
  firstName: '',
  lastName: '',
  email: '',
  phone: '',
  address: '',
  city: '',
  state: '',
  postalCode: '',
  country: 'Vietnam',
}

const CheckoutContext = createContext<CheckoutContextType | undefined>(undefined)

export function CheckoutProvider({ children }: { children: ReactNode }) {
  const [currentStep, setCurrentStep] = useState<CheckoutStep>(1)
  const [fulfillmentType, setFulfillmentType] = useState<FulfillmentType | null>(null)
  const [deliveryInfo, setDeliveryInfoState] = useState<DeliveryInfo>(defaultDeliveryInfo)
  const [selectedDelivery, setSelectedDelivery] = useState<DeliveryOption | undefined>()
  const [paymentInfo, setPaymentInfoState] = useState<PaymentInfo>({ method: 'card' })
  const [deliveryCost, setDeliveryCost] = useState(0)

  const setDeliveryInfo = (info: Partial<DeliveryInfo>) => {
    setDeliveryInfoState((prev) => ({ ...prev, ...info }))
  }

  const setPaymentInfo = (info: Partial<PaymentInfo>) => {
    setPaymentInfoState((prev) => ({ ...prev, ...info }))
  }

  const reset = () => {
    setCurrentStep(1)
    setFulfillmentType(null)
    setDeliveryInfoState(defaultDeliveryInfo)
    setSelectedDelivery(undefined)
    setPaymentInfoState({ method: 'card' })
    setDeliveryCost(0)
  }

  return (
    <CheckoutContext.Provider
      value={{
        currentStep,
        fulfillmentType,
        deliveryInfo,
        selectedDelivery,
        paymentInfo,
        deliveryCost,
        setCurrentStep,
        setFulfillmentType,
        setDeliveryInfo,
        setSelectedDelivery,
        setPaymentInfo,
        setDeliveryCost,
        reset,
      }}
    >
      {children}
    </CheckoutContext.Provider>
  )
}

export function useCheckout() {
  const context = useContext(CheckoutContext)
  if (context === undefined) {
    throw new Error('useCheckout must be used within CheckoutProvider')
  }
  return context
}
