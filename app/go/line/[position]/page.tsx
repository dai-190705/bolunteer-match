import RelayPage from '../../RelayPage'
import { LINE_POSITIONS, LINE_URL } from '@/app/nocsy-juku/line'

export const dynamicParams = false

export function generateStaticParams() {
  return LINE_POSITIONS.map((position) => ({ position }))
}

export default function GoLinePositionPage() {
  return <RelayPage url={LINE_URL} destination="NOCSY塾の公式LINE" />
}
