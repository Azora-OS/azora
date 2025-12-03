import React, { useState } from 'react';
import { WalletService } from '../services/wallet-service';

interface SendReceiveProps {
    onTransactionComplete?: () => void;
}

export const SendReceive: React.FC<SendReceiveProps> = ({ onTransactionComplete }) => {
    const [mode, setMode] = useState<'send' | 'receive'>('send');
    const [recipient, setRecipient] = useState('');
    const [amount, setAmount] = useState('');
    const [sending, setSending] = useState(false);
    const [message, setMessage] = useState('');
    const [messageType, setMessageType] = useState<'success' | 'error'>('success');

    const walletService = new WalletService();

    const handleSend = async () => {
        if (!recipient || !amount) {
            setMessageType('error');
            setMessage('Please enter recipient address and amount');
            return;
        }

        setSending(true);
        setMessage('');

        const result = await walletService.sendAZR(recipient, parseFloat(amount));

        if (result.success) {
            setMessageType('success');
            setMessage(`Transaction successful! Hash: ${result.txHash?.substring(0, 10)}...`);
            setRecipient('');
            setAmount('');
            if (onTransactionComplete) {
                onTransactionComplete();
            }
        } else {
            setMessageType('error');
            setMessage(result.error || 'Transaction failed');
        }

        setSending(false);
    };

    const getReceiveAddress = async () => {
        const address = await walletService.getWalletAddress();
        return address;
    };

    const [receiveAddress, setReceiveAddress] = useState('');

    React.useEffect(() => {
        if (mode === 'receive') {
            getReceiveAddress().then(setReceiveAddress);
        }
    }, [mode]);

    return (
        <div className="send-receive">
            <div className="mode-selector">
                <button
                    className={mode === 'send' ? 'active' : ''}
                    onClick={() => setMode('send')}
                >
                    Send
                </button>
                <button
                    className={mode === 'receive' ? 'active' : ''}
                    onClick={() => setMode('receive')}
                >
                    Receive
                </button>
            </div>

            {mode === 'send' ? (
                <div className="send-form">
                    <div className="form-group">
                        <label>Recipient Address</label>
                        <input
                            type="text"
                            placeholder="0x..."
                            value={recipient}
                            onChange={(e) => setRecipient(e.target.value)}
                        />
                    </div>
                    <div className="form-group">
                        <label>Amount (AZR)</label>
                        <input
                            type="number"
                            placeholder="0.00"
                            value={amount}
                            onChange={(e) => setAmount(e.target.value)}
                        />
                    </div>
                    <button
                        className="send-button"
                        onClick={handleSend}
                        disabled={sending}
                    >
                        {sending ? 'Sending...' : 'Send AZR'}
                    </button>
                </div>
            ) : (
                <div className="receive-section">
                    <p>Share this address to receive AZR:</p>
                    <div className="address-display">
                        {receiveAddress}
                    </div>
                    <button
                        className="copy-button"
                        onClick={() => {
                            navigator.clipboard.writeText(receiveAddress);
                            setMessageType('success');
                            setMessage('Address copied to clipboard!');
                        }}
                    >
                        Copy Address
                    </button>
                </div>
            )}

            {message && (
                <div className={`message ${messageType}`}>
                    {message}
                </div>
            )}

            <style jsx>{`
        .send-receive {
          background: white;
          padding: 24px;
          border-radius: 12px;
          box-shadow: 0 2px 8px rgba(0,0,0,0.1);
          margin: 20px 0;
        }

        .mode-selector {
          display: flex;
          gap: 10px;
          margin-bottom: 20px;
        }

        .mode-selector button {
          flex: 1;
          padding: 12px;
          border: 2px solid #e0e0e0;
          background: white;
          border-radius: 8px;
          cursor: pointer;
          font-size: 16px;
          transition: all 0.3s;
        }

        .mode-selector button.active {
          background: #667eea;
          color: white;
          border-color: #667eea;
        }

        .send-form {
          display: flex;
          flex-direction: column;
          gap: 16px;
        }

        .form-group {
          display: flex;
          flex-direction: column;
          gap: 8px;
        }

        .form-group label {
          font-size: 14px;
          font-weight: 500;
          color: #333;
        }

        .form-group input {
          padding: 12px;
          border: 1px solid #e0e0e0;
          border-radius: 8px;
          font-size: 16px;
        }

        .send-button {
          padding: 14px;
          background: #667eea;
          color: white;
          border: none;
          border-radius: 8px;
          font-size: 16px;
          font-weight: 500;
          cursor: pointer;
          transition: background 0.3s;
        }

        .send-button:hover:not(:disabled) {
          background: #5568d3;
        }

        .send-button:disabled {
          background: #ccc;
          cursor: not-allowed;
        }

        .receive-section {
          text-align: center;
        }

        .receive-section p {
          margin-bottom: 16px;
          color: #666;
        }

        .address-display {
          background: #f9f9f9;
          padding: 16px;
          border-radius: 8px;
          font-family: monospace;
          word-break: break-all;
          margin-bottom: 16px;
          border: 1px solid #e0e0e0;
        }

        .copy-button {
          padding: 12px 24px;
          background: #4CAF50;
          color: white;
          border: none;
          border-radius: 8px;
          cursor: pointer;
          font-size: 14px;
        }

        .copy-button:hover {
          background: #45a049;
        }

        .message {
          margin-top: 16px;
          padding: 12px;
          border-radius: 8px;
          font-size: 14px;
        }

        .message.success {
          background: #d4edda;
          color: #155724;
          border: 1px solid #c3e6cb;
        }

        .message.error {
          background: #f8d7da;
          color: #721c24;
          border: 1px solid #f5c6cb;
        }
      `}</style>
        </div>
    );
};
