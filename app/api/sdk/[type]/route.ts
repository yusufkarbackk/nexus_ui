import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ type: string }> }
) {
    const { type } = await params;

    // Map type to file
    const sdkFiles: Record<string, { filename: string; content: string }> = {
        python: {
            filename: 'nexus_enigma.py',
            content: getPythonSDK(),
        },
        javascript: {
            filename: 'nexus-enigma.js',
            content: getJavaScriptSDK(),
        },
    };

    const sdk = sdkFiles[type];
    if (!sdk) {
        return NextResponse.json({ error: 'SDK not found' }, { status: 404 });
    }

    return new NextResponse(sdk.content, {
        headers: {
            'Content-Type': 'text/plain',
            'Content-Disposition': `attachment; filename="${sdk.filename}"`,
        },
    });
}

function getPythonSDK(): string {
    return `"""
Nexus Enigma Client SDK for Python

End-to-end encryption for Nexus data ingestion.
Uses AES-256-GCM with daily key rotation via HKDF.

Requirements:
    pip install cryptography requests
"""

import base64
import json
from datetime import datetime, timezone
from typing import Any, Dict, Optional

from cryptography.hazmat.primitives import hashes
from cryptography.hazmat.primitives.kdf.hkdf import HKDF
from cryptography.hazmat.primitives.ciphers.aead import AESGCM
from cryptography.hazmat.backends import default_backend
import os
import requests


class NexusEnigma:
    """
    Nexus Enigma client for sending encrypted data.
    
    Example:
        client = NexusEnigma(
            app_key="my_app_key",
            master_secret="base64_encoded_secret_from_nexus",
            base_url="http://localhost:8080"
        )
        
        result = client.send({"temperature": 25.5, "humidity": 60})
        print(result)
    """
    
    NONCE_LENGTH = 12  # 96 bits for GCM
    KEY_LENGTH = 32    # 256 bits for AES-256
    
    def __init__(
        self, 
        app_key: str, 
        master_secret: str, 
        base_url: str = "http://localhost:8080",
        secret_version: int = 1
    ):
        """
        Initialize the Nexus Enigma client.
        
        Args:
            app_key: Your application's app_key from Nexus
            master_secret: Base64-encoded master secret from Nexus UI
            base_url: Nexus API base URL
            secret_version: Secret version for key rotation (default: 1)
        """
        self.app_key = app_key
        self.master_secret = base64.b64decode(master_secret)
        self.base_url = base_url.rstrip('/')
        self.secret_version = secret_version
    
    def send(self, data: Dict[str, Any]) -> Dict[str, Any]:
        """
        Send encrypted data to Nexus.
        
        Args:
            data: Dictionary payload to encrypt and send
            
        Returns:
            Response from Nexus API as dictionary
        """
        today = self._get_today_date()
        key = self._derive_key_for_date(today)
        ciphertext, nonce = self._encrypt(json.dumps(data), key)
        
        payload = {
            "encrypted": True,
            "keyDate": today,
            "secretVersion": self.secret_version,
            "nonce": base64.b64encode(nonce).decode('utf-8'),
            "data": base64.b64encode(ciphertext).decode('utf-8')
        }
        
        response = requests.post(
            f"{self.base_url}/ingress",
            headers={
                "Content-Type": "application/json",
                "X-API-Key": self.app_key
            },
            json=payload
        )
        
        return response.json()
    
    def _get_today_date(self) -> str:
        """Get today's date in YYYY-MM-DD format (UTC)."""
        return datetime.now(timezone.utc).strftime("%Y-%m-%d")
    
    def _derive_key_for_date(self, date: str) -> bytes:
        """Derive daily encryption key using HKDF."""
        hkdf = HKDF(
            algorithm=hashes.SHA256(),
            length=self.KEY_LENGTH,
            salt=self.app_key.encode('utf-8'),
            info=date.encode('utf-8'),
            backend=default_backend()
        )
        return hkdf.derive(self.master_secret)
    
    def _encrypt(self, plaintext: str, key: bytes) -> tuple:
        """Encrypt data using AES-256-GCM."""
        nonce = os.urandom(self.NONCE_LENGTH)
        aesgcm = AESGCM(key)
        ciphertext = aesgcm.encrypt(nonce, plaintext.encode('utf-8'), None)
        return ciphertext, nonce


# Convenience function
def create_client(app_key: str, master_secret: str, base_url: str = "http://localhost:8080") -> NexusEnigma:
    """Create a new Nexus Enigma client."""
    return NexusEnigma(app_key=app_key, master_secret=master_secret, base_url=base_url)
`;
}

function getJavaScriptSDK(): string {
    return `/**
 * Nexus Enigma Client SDK
 * 
 * End-to-end encryption for Nexus data ingestion.
 * Uses AES-256-GCM with daily key rotation via HKDF.
 */

const crypto = typeof window === 'undefined' ? require('crypto') : window.crypto;

class NexusEnigma {
    /**
     * Create a new Nexus Enigma client
     * @param {Object} options 
     * @param {string} options.appKey - Your application's app_key
     * @param {string} options.masterSecret - Base64-encoded master secret
     * @param {string} [options.baseUrl] - Nexus API base URL
     */
    constructor({ appKey, masterSecret, baseUrl = 'http://localhost:8080' }) {
        this.appKey = appKey;
        this.masterSecret = this._base64ToBytes(masterSecret);
        this.baseUrl = baseUrl;
    }

    /**
     * Send encrypted data to Nexus
     * @param {Object} data - The data payload to send
     * @returns {Promise<Object>} - Response from Nexus
     */
    async send(data) {
        const today = this._getTodayDate();
        const key = await this._deriveKeyForDate(today);
        const { ciphertext, nonce } = await this._encrypt(JSON.stringify(data), key);

        const payload = {
            encrypted: true,
            keyDate: today,
            secretVersion: 1,
            nonce: this._bytesToBase64(nonce),
            data: this._bytesToBase64(ciphertext)
        };

        const response = await fetch(\`\${this.baseUrl}/ingress\`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-API-Key': this.appKey
            },
            body: JSON.stringify(payload)
        });

        return response.json();
    }

    _getTodayDate() {
        return new Date().toISOString().split('T')[0];
    }

    async _deriveKeyForDate(date) {
        if (typeof window === 'undefined') {
            const hkdf = require('crypto').hkdfSync;
            return hkdf('sha256', this.masterSecret, Buffer.from(this.appKey), Buffer.from(date), 32);
        } else {
            const keyMaterial = await crypto.subtle.importKey('raw', this.masterSecret, 'HKDF', false, ['deriveBits']);
            const derivedBits = await crypto.subtle.deriveBits({
                name: 'HKDF', hash: 'SHA-256',
                salt: new TextEncoder().encode(this.appKey),
                info: new TextEncoder().encode(date)
            }, keyMaterial, 256);
            return new Uint8Array(derivedBits);
        }
    }

    async _encrypt(plaintext, key) {
        const nonce = crypto.getRandomValues 
            ? crypto.getRandomValues(new Uint8Array(12))
            : require('crypto').randomBytes(12);
        
        if (typeof window === 'undefined') {
            const cipher = require('crypto').createCipheriv('aes-256-gcm', key, nonce);
            const encrypted = Buffer.concat([cipher.update(plaintext, 'utf8'), cipher.final()]);
            const authTag = cipher.getAuthTag();
            return { ciphertext: Buffer.concat([encrypted, authTag]), nonce };
        } else {
            const cryptoKey = await crypto.subtle.importKey('raw', key, { name: 'AES-GCM' }, false, ['encrypt']);
            const ciphertext = await crypto.subtle.encrypt({ name: 'AES-GCM', iv: nonce }, cryptoKey, new TextEncoder().encode(plaintext));
            return { ciphertext: new Uint8Array(ciphertext), nonce };
        }
    }

    _base64ToBytes(base64) {
        if (typeof window === 'undefined') return Buffer.from(base64, 'base64');
        const binary = atob(base64);
        const bytes = new Uint8Array(binary.length);
        for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
        return bytes;
    }

    _bytesToBase64(bytes) {
        if (typeof window === 'undefined') return Buffer.from(bytes).toString('base64');
        let binary = '';
        for (let i = 0; i < bytes.length; i++) binary += String.fromCharCode(bytes[i]);
        return btoa(binary);
    }
}

if (typeof module !== 'undefined' && module.exports) module.exports = NexusEnigma;
if (typeof window !== 'undefined') window.NexusEnigma = NexusEnigma;
`;
}
