import { NextRequest, NextResponse } from 'next/server';
import { MEGAETH_TESTNET_CONFIG, MEGAETH_ERRORS } from '@/lib/megaeth-config';
import { MegaETHUtils } from '@/lib/megaeth-utils';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const action = searchParams.get('action');

    switch (action) {
      case 'network-status':
        const networkHealth = await MegaETHUtils.checkNetworkHealth();
        return NextResponse.json({
          ...networkHealth,
          config: {
            chainId: MEGAETH_TESTNET_CONFIG.chainId,
            rpcUrls: MEGAETH_TESTNET_CONFIG.rpcUrls,
            blockExplorerUrls: MEGAETH_TESTNET_CONFIG.blockExplorerUrls,
          },
          timestamp: Date.now()
        });

      case 'gas-prices':
        // Mock gas price data for MegaETH
        return NextResponse.json({
          slow: '1.0 gwei',
          standard: '2.0 gwei',
          fast: '5.0 gwei',
          timestamp: Date.now(),
          blockTime: MEGAETH_TESTNET_CONFIG.performance.blockTime,
          maxTps: MEGAETH_TESTNET_CONFIG.performance.maxTps
        });

      case 'faucet-info':
        return NextResponse.json({
          faucetUrl: "https://testnet.megaeth.com/#2",
          dailyLimit: '10 MegaETH tokens',
          cooldown: '24 hours',
          requirements: ['Valid Ethereum address', 'Not exceeded daily limit'],
          redirectAfterLinking: true,
          timestamp: Date.now()
        });

      case 'contracts':
        return NextResponse.json({
          contracts: MEGAETH_TESTNET_CONFIG.contracts,
          verified: true,
          deployedAt: {
            quantumJobLogger: 'Block #1234567'
          },
          timestamp: Date.now()
        });

      default:
        return NextResponse.json({
          network: 'MegaETH Network',
          chainId: MEGAETH_TESTNET_CONFIG.chainId,
          status: 'operational',
          features: MEGAETH_TESTNET_CONFIG.features,
          performance: MEGAETH_TESTNET_CONFIG.performance,
          tokenLinkingUrl: 'https://testnet.megaeth.com/#2',
          timestamp: Date.now()
        });
    }

  } catch (error) {
    return NextResponse.json(
      { 
        error: 'MegaETH API request failed',
        details: error instanceof Error ? error.message : 'Unknown error',
        timestamp: Date.now()
      },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const { action, data } = await request.json();

    switch (action) {
      case 'validate-network':
        const { chainId } = data;
        const isValid = chainId === MEGAETH_TESTNET_CONFIG.chainId;
        
        return NextResponse.json({
          isValid,
          expectedChainId: MEGAETH_TESTNET_CONFIG.chainId,
          currentChainId: chainId,
          message: isValid ? 'Connected to MegaETH Testnet' : MEGAETH_ERRORS.WRONG_NETWORK,
          timestamp: Date.now()
        });

      case 'estimate-gas':
        const { to, value, data: txData } = data;
        
        let gasEstimate = 21000; // Base transaction cost
        
        if (txData && txData.length > 0) {
          gasEstimate += txData.length * 16; // Data cost
        }
        
        if (to === MEGAETH_TESTNET_CONFIG.contracts.quantumJobLogger) {
          gasEstimate += 50000; // Contract interaction cost
        }

        const gasPrice = MegaETHUtils.getOptimizedGasSettings('standard').gasPrice;
        const totalCost = (gasEstimate * gasPrice) / 1e18; // Convert to ETH

        return NextResponse.json({
          gasEstimate,
          gasPrice: gasPrice / 1e9, // Convert to gwei for display
          totalCost,
          optimized: true,
          timestamp: Date.now()
        });

      case 'check-contract':
        const { contractAddress } = data;
        const isKnownContract = Object.values(MEGAETH_TESTNET_CONFIG.contracts).includes(contractAddress);
        
        return NextResponse.json({
          isKnownContract,
          contractType: isKnownContract ? 'QuantumJobLogger' : 'Unknown',
          verified: isKnownContract,
          explorerUrl: `${MEGAETH_TESTNET_CONFIG.blockExplorerUrls[0]}address/${contractAddress}`,
          timestamp: Date.now()
        });

      default:
        return NextResponse.json(
          { error: 'Unknown MegaETH action' },
          { status: 400 }
        );
    }

  } catch (error) {
    return NextResponse.json(
      { 
        error: 'MegaETH operation failed',
        details: error instanceof Error ? error.message : 'Unknown error',
        timestamp: Date.now()
      },
      { status: 500 }
    );
  }
}