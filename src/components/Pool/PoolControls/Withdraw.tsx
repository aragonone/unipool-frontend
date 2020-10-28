import React, { useCallback, useMemo, useState } from 'react'
// @ts-ignore
import TokenAmount from 'token-amount'
import {
  useWithdraw,
  useWithdrawAllIncludingRewards,
} from '../../../hooks/useContract'
import { useAccountModule } from '../../Account/AccountModuleProvider'
import AmountCard from '../../AmountCard/AmountCard'
import AmountInput from '../../AmountInput/AmountInput'
import { usePoolBalance } from '../PoolBalanceProvider'
import { usePoolInfo } from '../PoolInfoProvider'
import ControlButton from './ControlButton'
import useInputValidation from './useInputValidation'

type WithdrawProps = {
  exitAllBalance: boolean
}

function Withdraw({ exitAllBalance }: WithdrawProps): JSX.Element {
  const [amount, setAmount] = useState('')
  const { stakeToken, contractGroup } = usePoolInfo()
  const {
    stakedBalanceInfo: [stakedBalance, stakedBalanceStatus],
    tokenDecimals,
  } = usePoolBalance()
  const { showAccount } = useAccountModule()
  const withdraw = useWithdraw(contractGroup)
  const withdrawAllIncludingRewards = useWithdrawAllIncludingRewards(
    contractGroup
  )

  const {
    maxAmount,
    validationStatus,
    floatRegex,
    parsedAmountBn,
  } = useInputValidation({
    amount: amount,
    balance: stakedBalance,
    decimals: tokenDecimals,
  })

  // TODO: Fix this hack
  const exitAllValidationStatus = useMemo(() => {
    if (!stakedBalance) {
      return 'notConnected'
    }

    if (stakedBalance.isZero()) {
      return 'insufficientBalance'
    }

    return 'valid'
  }, [stakedBalance])

  const filteredValidationStatus = exitAllBalance
    ? exitAllValidationStatus
    : validationStatus

  const handleAmountChange = useCallback(
    (event) => {
      const value = event.target.value

      if (floatRegex.test(value)) {
        setAmount(value)
      }
    },
    [floatRegex]
  )

  const handleMaxClick = useCallback(() => {
    setAmount(maxAmount)
  }, [maxAmount])

  const handleSubmit = useCallback(
    (event) => {
      event.preventDefault()

      if (filteredValidationStatus === 'notConnected') {
        showAccount()
      }

      if (filteredValidationStatus === 'valid') {
        if (exitAllBalance) {
          withdrawAllIncludingRewards()
        } else {
          withdraw(parsedAmountBn)
        }
      }
    },
    [
      parsedAmountBn,
      showAccount,
      filteredValidationStatus,
      withdraw,
      exitAllBalance,
      withdrawAllIncludingRewards,
    ]
  )

  const formattedStakedBalance = useMemo(
    (): string | null =>
      stakedBalance &&
      new TokenAmount(stakedBalance, tokenDecimals).format({
        digits: tokenDecimals,
      }),
    [stakedBalance, tokenDecimals]
  )

  return (
    <form onSubmit={handleSubmit}>
      {!exitAllBalance && (
        <div
          css={`
            margin-bottom: 40px;
          `}
        >
          <AmountInput
            value={amount}
            onChange={handleAmountChange}
            onMaxClick={handleMaxClick}
            placeholder="Enter amount to withdraw"
            showMax={validationStatus !== 'notConnected'}
          />
        </div>
      )}

      <AmountCard
        label={`Amount available to withdraw`}
        tokenGraphic={stakeToken.graphic}
        suffix={stakeToken.symbol}
        value={formattedStakedBalance ? formattedStakedBalance : '0'}
        loading={stakedBalanceStatus === 'loading'}
        css={`
          margin-bottom: 40px;
        `}
      />
      <ControlButton status={filteredValidationStatus} label="Withdraw" />
    </form>
  )
}

export default Withdraw
