import React, { useCallback, useMemo } from 'react'
// @ts-ignore
import TokenAmount from 'token-amount'
import { useClaimRewards } from '../../../hooks/useContract'
import { useAccountModule } from '../../Account/AccountModuleProvider'
import AmountCard from '../../AmountCard/AmountCard'
import { usePoolBalance } from '../PoolBalanceProvider'
import { usePoolInfo } from '../PoolInfoProvider'
import { ValidationStatus } from '../types'
import ControlButton from './ControlButton'

function Claim(): JSX.Element {
  const { rewardToken, contractGroup } = usePoolInfo()
  const { rewardsBalanceInfo } = usePoolBalance()
  const { showAccount } = useAccountModule()
  const handleClaim = useClaimRewards(contractGroup)

  const [rewardsBalance, rewardsBalanceStatus] = rewardsBalanceInfo

  const formattedRewardsBalance = useMemo(
    (): string | null =>
      rewardsBalance &&
      new TokenAmount(rewardsBalance, rewardToken.decimals).format({
        digits: rewardToken.decimals,
      }),
    [rewardsBalance, rewardToken.decimals]
  )

  const validationStatus = useMemo((): ValidationStatus => {
    if (!rewardsBalance) {
      return 'notConnected'
    }

    if (rewardsBalance.isZero()) {
      return 'noAmount'
    }

    return 'valid'
  }, [rewardsBalance])

  const handleSubmit = useCallback(
    (event) => {
      event.preventDefault()

      if (validationStatus === 'notConnected') {
        showAccount()
      }

      if (validationStatus === 'valid') {
        handleClaim()
      }
    },
    [showAccount, validationStatus, handleClaim]
  )

  return (
    <form onSubmit={handleSubmit}>
      <AmountCard
        label="Rewards available to withdraw"
        tokenGraphic={rewardToken.graphic}
        suffix={rewardToken.symbol}
        value={formattedRewardsBalance ? formattedRewardsBalance : '0'}
        loading={rewardsBalanceStatus === 'loading'}
        css={`
          margin-top: 10px;
          margin-bottom: 30px;
        `}
      />
      <ControlButton
        status={validationStatus}
        labels={{
          notConnected: 'Connect wallet',
          insufficientBalance: '',
          noAmount: 'No rewards to claim',
          valid: 'Claim rewards',
          loading: '',
        }}
      />
    </form>
  )
}

export default Claim
