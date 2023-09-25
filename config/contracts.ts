import ORManagerABI from './abis/ORManager.abi.json'
import ORMDCFactoryABI from './abis/ORMDCFactory.abi.json'
import ORFeeManagerABI from './abis/ORFeeManager.abi.json'
import OREventBindingABI from './abis/OREventBinding.abi.json'
import ORMakerDepositABI from './abis/ORMakerDeposit.abi.json'
import ORChallengeSpvABI from './abis/ORChallengeSpv.abi.json'

import { Address } from 'viem'

export const orManagerAddress = process.env.NEXT_PUBLIC_OR_MANAGER_ADDRESS

export const orMakerDepositImplAddress =
  process.env.NEXT_PUBLIC_OR_MAKER_DEPOSIT_IMPL_ADDRESS

export const orMDCFactoryAddress =
  process.env.NEXT_PUBLIC_OR_MDC_FACTORY_ADDRESS

export const orFeeManagerAddress =
  process.env.NEXT_PUBLIC_OR_FEE_MANAGER_ADDRESS

export const orEventBindingAddress =
  process.env.NEXT_PUBLIC_OR_EVENT_BINDING_ADDRESS

export const orChallengeSPVAddress =
  process.env.NEXT_PUBLIC_OR_CHALLENGE_SPV_ADDRESS

export const contracts = {
  orManager: {
    address: orManagerAddress,
    abi: ORManagerABI,
  },

  orMDCFactory: {
    address: orMDCFactoryAddress,
    abi: ORMDCFactoryABI,
  },

  orMakerDepositImpl: {
    address: orMakerDepositImplAddress,
    abi: ORMakerDepositABI,
  },

  orFeeManager: {
    address: orFeeManagerAddress,
    abi: ORFeeManagerABI,
  },

  orEventBinding: {
    address: orEventBindingAddress,
    abi: OREventBindingABI,
  },

  orChallengeSpv: {
    address: orChallengeSPVAddress,
    abi: ORChallengeSpvABI,
  },
} as Record<string, { address: Address; abi: any[] }>
