import RelayPage from '../../RelayPage'
import { FORM_URL } from '../form-url'

const DOCUMENT_REQUEST_POSITIONS = ['header', 'hero', 'bottom'] as const

export const dynamicParams = false

export function generateStaticParams() {
  return DOCUMENT_REQUEST_POSITIONS.map((position) => ({ position }))
}

export default function GoFormPositionPage() {
  return <RelayPage url={FORM_URL} destination="資料請求フォーム" />
}
