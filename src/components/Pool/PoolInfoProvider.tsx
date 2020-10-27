import React, { ReactNode, useContext, useMemo } from 'react'
import { ContractGroup } from '../../environment/types'

export type PoolName =
  | 'unipoolAntV1Eth'
  | 'unipoolAntV2Eth'
  | 'balancerAntV2Usdc'

type PoolInfoProviderState = {
  poolName: PoolName
  children: ReactNode
}

type PoolAttributes = {
  tokenGraphic: string
  tokenSymbol: string
  contractGroup: ContractGroup
  liquidityUrl: string | null
}

type PoolInfoContext = PoolAttributes

const UsePoolInfoContext = React.createContext<PoolInfoContext | null>(null)

function PoolInfoProvider({
  children,
  poolName,
}: PoolInfoProviderState): JSX.Element {
  const {
    tokenGraphic,
    tokenSymbol,
    contractGroup,
    liquidityUrl,
  } = useMemo((): PoolAttributes => {
    const attributes: Record<PoolName, PoolAttributes> = {
      unipoolAntV1Eth: {
        tokenGraphic: '',
        tokenSymbol: 'UNI',
        contractGroup: 'unipoolAntV1',
        liquidityUrl: null,
      },
      unipoolAntV2Eth: {
        tokenGraphic: '',
        tokenSymbol: 'UNI',
        contractGroup: 'unipoolAntV2',
        liquidityUrl:
          'https://info.uniswap.org/pair/0x9def9511fec79f83afcbffe4776b1d817dc775ae',
      },
      balancerAntV2Usdc: {
        tokenGraphic: '',
        tokenSymbol: 'BPT',
        contractGroup: 'balancer',
        liquidityUrl:
          'https://pools.balancer.exchange/#/pool/0xde0999ee4e4bea6fecb03bf4ebef2626942ec6f5/',
      },
    }

    return attributes[poolName]
  }, [poolName])

  const contextValue = useMemo(
    (): PoolInfoContext => ({
      tokenGraphic,
      tokenSymbol,
      contractGroup,
      liquidityUrl,
    }),
    [tokenGraphic, tokenSymbol, contractGroup, liquidityUrl]
  )

  return (
    <UsePoolInfoContext.Provider value={contextValue}>
      {children}
    </UsePoolInfoContext.Provider>
  )
}

function usePoolInfo(): PoolInfoContext {
  return useContext(UsePoolInfoContext) as PoolInfoContext
}

export { PoolInfoProvider, usePoolInfo }
