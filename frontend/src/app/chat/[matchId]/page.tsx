import Link from 'next/link'

export default function ChatPage({ params }: { params: { matchId: string } }) {
  return (
    <div className="mobile-container placeholder-page">
      <h1>Chat</h1>
      <p>🚧 Chat Thread Screen - TODO</p>
      <p>Match ID: {params.matchId}</p>
      <p>1-to-1 messaging</p>
      <p>Message input</p>
      <p>Read status / typing indicator (optional)</p>
      
      <nav className="placeholder-nav">
        <Link href="/matches">← Back to Matches</Link>
      </nav>
    </div>
  )
}
