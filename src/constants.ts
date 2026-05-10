import { Lesson } from './types';

export const LESSONS: Lesson[] = [
  // --- SECTION 1: ASSETS ---
  {
    id: 'assets-1',
    section: 'Assets',
    category: 'The Basics',
    title: 'Unit 1: Introduction to Assets',
    description: 'Learn the fundamental building blocks of the financial world.',
    content: 'Welcome to your first step in investing! Before you trade, you must know what you are trading. We call these "Assets."',
    xpReward: 500,
    articleUrl: 'https://www.investopedia.com/terms/a/asset.asp',
    subTopics: [
      {
        id: 'assets-1-1',
        title: 'Step 1: What is an Asset?',
        content: 'An **Asset** is a resource with an economic value that an individual, corporation, or country owns or controls with the expectation that it will provide a future benefit.\n\nThink of it as anything that puts money in your pocket (or has the potential to do so) in the future.',
        funFact: 'Did you know? In ancient times, cattle were one of the earliest forms of assets used for trade!',
        visualData: { 
          type: 'icon-group', 
          items: [
            { icon: 'Building', label: 'Real Estate', info: 'Physical property like land and buildings that can appreciate in value or provide rental income.' },
            { icon: 'Wallet', label: 'Cash', info: 'Liquidity available to be deployed into other investments or used for immediate needs.' },
            { icon: 'Coins', label: 'Commodities', info: 'Raw materials or primary agricultural products like Gold or Oil that can be traded.' }
          ]
        }
      },
      {
        id: 'assets-1-2',
        title: 'Step 2: The 4 Major Asset Classes',
        content: 'Investors generally group assets into 4 main classes:\n1. **Equities** (Stocks)\n2. **Fixed Income** (Bonds)\n3. **Derivatives** (Contracts)\n4. **Alternatives** (Crypto, Real Estate, Gold)',
        quickQuestion: {
          question: 'How many primary Asset Classes are there in traditional investing?',
          type: 'MCQ',
          options: ['2', '4', '6', '10'],
          correctAnswer: 1,
          explanation: 'There are 4 major classes: Equities, Fixed Income, Derivatives, and Alternatives.'
        }
      },
      {
        id: 'assets-1-3',
        title: 'Step 3: Equities (Stocks)',
        content: 'Equity represents **ownership**. When you buy a **Stock**, you are essentially "owning a slice of a business."\n\nExample: **Apple Inc. { AAPL }** is a fraction of the corporation. If Apple grows, your slice becomes more valuable.',
        funFact: 'The first ever stock was issued by the Dutch East India Company in 1602!',
        visualData: { type: 'stock-sim' }
      },
      {
        id: 'assets-1-4',
        title: 'Step 4: Fixed Income (Bonds)',
        content: 'Fixed Income assets, like **Bonds**, are essentially loans you make to a government or corporation. In return, they pay you interest over time and return your original investment at the end.',
        funFact: 'The bond market is actually significantly larger than the stock market!',
        visualData: { type: 'bond-sim' }
      },
      {
        id: 'assets-1-5',
        title: 'Step 5: Derivatives',
        content: '**Derivatives** are complex financial contracts that "derive" their value from an underlying asset, like a stock, commodity, or currency.\n\nThe four main types are **Forwards, Futures, Options, and Swaps**.',
        funFact: 'Derivatives were originally invented to help farmers protect themselves against the risk of crop prices falling!',
        visualData: { type: 'derivative-sim' }
      },
      {
        id: 'assets-1-6',
        title: 'Step 6: Alternatives',
        content: '**Alternatives** are non-traditional investments that don\'t fit into the Big Three (Stocks, Bonds, Cash).\n\nThis includes **Cryptocurrencies** (Bitcoin), Gold, Real Estate, and even fine art.',
        funFact: 'Bitcoin is often called "Digital Gold" because of its limited supply and store-of-value properties.',
        visualData: { type: 'alt-sim' }
      },
      {
        id: 'assets-1-7',
        title: 'Step 7: Putting it Together',
        content: 'To summarize the landscape:\n- **Stocks** = Ownership slices.\n- **Bonds** = Loans for interest.\n- **Derivatives** = Price-based contracts.\n- **Alternatives** = Non-traditional (Crypto, Gold).',
        visualData: { 
          type: 'icon-group', 
          items: [
            { icon: 'Apple', label: 'Apple (AAPL)', info: 'Equity' },
            { icon: 'ShieldCheck', label: 'US Treasury', info: 'Fixed Income' },
            { icon: 'Coins', label: 'Bitcoin (BTC)', info: 'Alternative' },
            { icon: 'Zap', label: 'Options', info: 'Derivative' }
          ]
        }
      }
    ],
    quiz: [
      {
        question: 'What is an Asset in investing?',
        type: 'MCQ',
        options: [
          'A resource with an economic value owned with the expectation of future benefit.',
          'The residual interest belonging to shareholders.',
          'Something a person or company owes.',
          'Total revenue generated from core operations.'
        ],
        correctAnswer: 0,
        explanation: 'Assets are resources owned or controlled to produce future economic value.'
      },
      {
        question: 'How many Asset Classes exist in investing?',
        type: 'MCQ',
        options: ['4', '7', '9', '3'],
        correctAnswer: 0,
        explanation: 'The four main classes are Equities, Fixed Income, Derivatives, and Alternatives.'
      },
      {
        question: 'Which is an example of an Equity Asset?',
        type: 'MCQ',
        options: ['Stocks', 'Cryptocurrencies', 'Foreign Exchange', 'Bonds'],
        correctAnswer: 0,
        explanation: 'Stocks are the primary form of equity (ownership).'
      },
      {
        question: 'What is the definition of Stocks in investing?',
        type: 'MCQ',
        options: [
          'An asset that represents the ownership of a fraction of the issuing corporation.',
          'A loan made by an investor to a borrower.',
          'A digital or virtual currency based on a network.',
          'An asset based on underlying securities.'
        ],
        correctAnswer: 0,
        explanation: 'Stocks represent a fractional ownership in a company.'
      },
      {
        question: 'What’s a simple way of describing Stocks in investing?',
        type: 'MCQ',
        options: [
          'Owning a slice of a business.',
          'Lending money to the government.',
          'Having certified investors help you.',
          'Purchasing the entirety of a corporation.'
        ],
        correctAnswer: 0,
        explanation: 'Stocks are essentially fractional ownership of a company.'
      },
      {
        question: 'Which of these Assets classify as a Stock?',
        type: 'MCQ',
        options: [
          'Apple Inc. { AAPL }',
          'EUR / USD',
          'Gold',
          'Bitcoin'
        ],
        correctAnswer: 0,
        explanation: 'Apple (AAPL) is a publicly traded corporation.'
      },
      {
        question: 'What are the four types of Derivatives in investing?',
        type: 'WQ',
        correctAnswer: 'Forwards, Futures, Options, Swaps',
        explanation: 'The four pillars of derivatives are Forwards, Futures, Options, and Swaps.'
      },
      {
        question: 'Select an example of an Alternative Asset.',
        type: 'MCQ',
        options: ['Cryptocurrencies', 'ETFs', 'Futures', 'NVIDIA Corporation { NVDA }'],
        correctAnswer: 0,
        explanation: 'Cryptocurrencies are a major class of alternative investments.'
      }
    ]
  },
  {
    id: 'assets-2',
    section: 'Assets',
    category: 'Risk Management',
    title: 'Unit 2: Risk and Reward of Assets',
    description: 'Understand the relationship between potential gains and potential losses.',
    content: 'In the world of finance, there is no such thing as a "free lunch." Higher potential rewards usually come with higher risks.',
    xpReward: 600,
    articleUrl: 'https://www.investopedia.com/terms/r/riskreturntradeoff.asp',
    subTopics: [
      {
        id: 'assets-2-1',
        title: 'Step 1: Defining Risk',
        content: '**Risk** is the potential for loss. It is the uncertainty that your investment will not achieve its expected return or will lose its original value.',
        funFact: 'Market volatility is often measured by the VIX, also known as the "Fear Gauge."',
        visualData: { 
          type: 'bar-chart', 
          label: 'Level of Risk',
          data: [{ name: 'Safe', value: 10 }, { name: 'Risky', value: 90 }] 
        }
      },
      {
        id: 'assets-2-2',
        title: 'Step 2: The Risk-Reward Tradeoff',
        content: 'The general consensus is: **The higher the risk, the higher the potential return.**\n\nThis means you can gain a lot, but also lose a lot at the same time depending on the asset type.',
        quickQuestion: {
          question: 'Does higher risk always guarantee a higher return?',
          type: 'MCQ',
          options: ['Yes, always', 'No, it only increases the potential', 'Only in bull markets'],
          correctAnswer: 1,
          explanation: 'Risk only implies *potential*. There is no guarantee of success in high-risk environments.'
        }
      },
      {
        id: 'assets-2-3',
        title: 'Step 3: Ranking the Risk',
        content: 'From highest to lowest risk:\n1. **Derivatives** (High leverage)\n2. **Alternatives** (Illiquid, volatile)\n3. **Equities** (Market fluctuations)\n4. **Fixed Income** (Government backed)\n\n**Equities** are riskier than **Fixed Income** because share prices fluctuate with market conditions and companies can go bankrupt, wiping out shareholders. **Alternatives** can be risky because they are often **illiquid**, meaning they cannot be easily bought or sold quickly.',
        visualData: { 
          type: 'icon-group', 
          items: [
            { icon: 'ShieldCheck', label: 'Fixed Income', info: 'Lower risk. Includes Government Bonds where you lend money for interest.' },
            { icon: 'TrendingUp', label: 'Equities', info: 'Moderate to High risk. Owning company shares that fluctuate with earnings.' },
            { icon: 'Building', label: 'Alternatives', info: 'High risk. Includes Real Estate or Crypto which can be hard to sell quickly.' },
            { icon: 'Lock', label: 'Derivatives', info: 'Very High risk. Complex contracts using leverage that can multiply losses.' }
          ]
        }
      }
    ],
    quiz: [
      {
        question: 'Which answer is the Asset Class with the highest level of risk?',
        type: 'MCQ',
        options: ['Derivatives', 'Equities', 'Fixed Income', 'Alternatives'],
        correctAnswer: 0,
        explanation: 'Derivatives are considered high risk due to their complexity and potential for high leverage.'
      },
      {
        question: 'What primarily makes Derivatives so high in risk?',
        type: 'MCQ',
        options: [
          'The amount of leverage that can be used when trading them.',
          'They are only available to large banks.',
          'They always expire worthless.',
          'They cannot be sold once purchased.'
        ],
        correctAnswer: 0,
        explanation: 'Leverage allows you to control a large position with a small amount of money, magnifying both gains and losses.'
      },
      {
        question: 'What is the definition of Risk in investing?',
        type: 'MCQ',
        options: [
          'The potential for loss.',
          'The guaranteed return on an investment.',
          'The guaranteed loss for an investment.',
          'The difference between buying and selling price.'
        ],
        correctAnswer: 0,
        explanation: 'Risk is the uncertainty and potential for a negative outcome or loss.'
      },
      {
        question: 'What is the general consensus between Risk and Reward in investing?',
        type: 'MCQ',
        options: [
          'The higher the risk, the higher the potential return.',
          'Higher risk always guarantees a higher return.',
          'Lower risk index always outperforms high risk.',
          'There is no relationship.'
        ],
        correctAnswer: 0,
        explanation: 'Investors require higher potential returns to compensate for taking on more risk.'
      },
      {
        question: 'Why are Fixed Income Assets usually lower in risk? (Choose 2)',
        type: 'TQ',
        options: [
          'They are mostly bonded by contracts to pay interest.',
          'Most are backed by the government (e.g. US Treasuries).',
          'They are guaranteed to never lose value.',
          'They are unaffected by inflation.'
        ],
        correctAnswer: [0, 1],
        explanation: 'Fixed income assets have legal obligations and government backing, making them safer than equities.'
      },
      {
        question: 'Which of the following best describes the risk profile of Equities compared to Fixed Income?',
        type: 'MCQ',
        options: [
          'Equities carry higher risk because share prices fluctuate and companies can go bankrupt.',
          'Equities are lower risk because shareholders are paid before bondholders.',
          'Equities and Fixed Income carry identical levels of risk.',
          'Equities are lower risk because they are backed by government guarantees.'
        ],
        correctAnswer: 0,
        explanation: 'Equities represent ownership without guarantees, while Bondholders are primary creditors.'
      },
      {
        question: 'What is a key characteristic that makes Alternative Assets higher in risk compared to Fixed Income Assets?',
        type: 'MCQ',
        options: [
          'Some Alternatives are often illiquid, meaning they cannot be easily bought or sold quickly.',
          'Alternatives are always leveraged, multiplying both gains and losses.',
          'Alternatives are only available to retail investors.',
          'Alternatives have legally guaranteed returns.'
        ],
        correctAnswer: 0,
        explanation: 'Liquidity risk is a major factor in alternative investments like real estate or private equity.'
      }
    ]
  },
  // --- SECTION 2: TERMINOLOGY ---
  {
    id: 'terminology-1',
    section: 'Terminology',
    category: 'Lingo',
    title: 'Unit 1: Terminologies I',
    description: 'Learn to speak the language of the markets.',
    content: 'Every industry has its own language. To navigate the markets, you need to understand the lingo brokers and traders use.',
    xpReward: 500,
    articleUrl: 'https://www.investopedia.com/financial-term-dictionary-4769738',
    subTopics: [
      {
        id: 'term-1-1',
        title: 'Step 1: Bid-Ask Spread',
        content: 'The **Bid** is the highest price a buyer wants to pay. The **Ask** is the lowest price a seller wants to accept.\n\nThe difference between them is the **Spread**.',
        funFact: 'High-volume stocks like Apple usually have very tiny spreads, sometimes just a penny!',
        visualData: { type: 'bid-ask-sim' }
      },
      {
        id: 'term-1-2',
        title: 'Step 2: Going Long vs. Short',
        content: '**Long**: Buying an asset expecting price to RISE.\n**Short**: Selling a borrowed asset expecting price to FALL, then buying it back cheaper.',
        quickQuestion: {
          question: 'If you think an asset will go down in value, which position should you take?',
          type: 'MCQ',
          options: ['Long', 'Short', 'Sideways'],
          correctAnswer: 1,
          explanation: 'Shorting allows you to profit from declining prices.'
        },
        visualData: { type: 'long-short-sim' }
      },
      {
        id: 'term-1-3',
        title: 'Step 3: Retail vs. Institutional',
        content: '**Retail Investors**: Individuals like you and me using personal apps.\n**Institutional Investors**: Large organizations (Pension Funds, Hedge Funds, Banks) that trade massive amounts of capital.',
        funFact: 'Institutions account for about 80% of the trading volume on the NYSE!',
        visualData: { type: 'retail-inst-sim' }
      },
      {
        id: 'term-1-4',
        title: 'Step 4: Markets and Sentiment',
        content: '**Bull Market**: When prices are rising and sentiment is positive. Symbolized by the Bull attacking UP.\n**Bear Market**: When prices are falling and sentiment is negative. Symbolized by the Bear attacking DOWN.\n\nExample: If news says Gold is in a **Bear market**, its price is on a sustained downward trend.',
        visualData: { type: 'sentiment-sim' }
      },
      {
        id: 'term-1-5',
        title: 'Step 5: Portfolio Essentials',
        content: '**Diversification**: Spreading investments across different assets to reduce risk. "Don\'t put all your eggs in one basket."\n**Liquidity**: How quickly and easily an asset can be sold without affecting its price.\n**Volatility**: The rate at which the price of an asset increases or decreases. **Stocks** are generally more volatile than **Bonds**.',
        funFact: 'Cash is the most liquid asset, while Real Estate is considered highly illiquid.',
        visualData: { type: 'portfolio-sim' }
      }
    ],
    quiz: [
      {
        question: 'What is the Bid-Ask Spread?',
        type: 'MCQ',
        options: [
          'The difference between the highest buyer price and lowest seller price.',
          'The total commission charged by a broker.',
          'The daily price range of an asset.',
          'The gap from the all-time high.'
        ],
        correctAnswer: 0,
        explanation: 'Spread = Ask - Bid. It represents the liquidity and transaction cost.'
      },
      {
        question: 'What is the difference between a Long and Short Position?',
        type: 'MCQ',
        options: [
          'Long: thinking it rises; Short: thinking it falls.',
          'Long: held > year; Short: held < year.',
          'Long: uses leverage; Short: does not.',
          'There is no difference.'
        ],
        correctAnswer: 0,
        explanation: 'Long is for bulls; Short is for bears.'
      },
      {
        question: 'Which answers are examples of Institutional Investors? (Choose 2)',
        type: 'TQ',
        options: [
          'A pension fund managing savings.',
          'A hedge fund pooling capital from wealthy clients.',
          'An individual buying stock on an app.',
          'A person contributing to savings.'
        ],
        correctAnswer: [0, 1],
        explanation: 'Institutions are large organizations that trade in high volumes, unlike retail investors.'
      },
      {
        question: 'Are Bonds or Stocks more volatile in price movement?',
        type: 'MCQ',
        options: ['Stocks', 'Bonds', 'They are equally volatile'],
        correctAnswer: 0,
        explanation: 'Equities (Stocks) typically experience larger and more frequent price swings than Fixed Income (Bonds).'
      },
      {
        question: 'What do news headlines mean when it is emphasized that Gold is currently in a Bear market?',
        type: 'MCQ',
        options: [
          'Prices are on a sustained downward trend.',
          'Gold is at an all-time high.',
          'Gold is no longer available for trading.',
          'Gold price has been stable with no movement.'
        ],
        correctAnswer: 0,
        explanation: 'A bear market indicates falling prices and negative sentiment.'
      },
      {
        question: 'What is Diversification and why is it important?',
        type: 'MCQ',
        options: [
          'Spreading investments across assets to reduce risk.',
          'Investing all capital into the single highest performer.',
          'Buying and selling the same asset simultaneously.',
          'Holding only cash to avoid all risk.'
        ],
        correctAnswer: 0,
        explanation: 'Diversification reduces the impact of any single asset\'s failure on your total portfolio.'
      },
      {
        question: 'What is Liquidity in the context of investing?',
        type: 'MCQ',
        options: [
          'How easily an asset can be converted to cash without affecting its price.',
          'The total profit generated by an asset.',
          'The amount of debt a company uses.',
          'The interest rate paid on a bond.'
        ],
        correctAnswer: 0,
        explanation: 'High liquidity means you can buy or sell quickly at the current market price.'
      }
    ]
  },
  {
    id: 'terminology-2',
    section: 'Terminology',
    category: 'Advanced Lingo',
    title: 'Unit 2: Terminologies II',
    description: 'Diving deeper into advanced market mechanics including leverage, DCA, and economic cycles.',
    content: 'Now that you have the basics, let\'s look at strategies, key players, and the economic environments that drive the markets.',
    xpReward: 600,
    articleUrl: 'https://www.investopedia.com/terms/d/dollarcostaveraging.asp',
    subTopics: [
      {
        id: 'term-2-1',
        title: 'Step 1: Leverage',
        content: '**Leverage** is using borrowed money from a broker to increase your position size. While it amplifies potential gains, it also significantly amplifies potential losses.\n\nThink of it as a "multiplier" for your capital. A 10:1 leverage means $1,000 controls $10,000 worth of assets.',
        funFact: 'In the 2008 financial crisis, some banks had leverage ratios higher than 30:1!',
        visualData: {
          type: 'sentiment-sim',
          label: 'Leverage Risk Simulator',
          labels: ['Moderate', 'Aggressive'],
          statuses: ['STEADY GROWTH', 'EXTREME VOLATILITY']
        }
      },
      {
        id: 'term-2-2',
        title: 'Step 2: Dollar-Cost Averaging (DCA)',
        content: '**DCA** is a strategy where you invest a fixed amount of money at regular intervals (e.g., $100 every month) regardless of the price.\n\nThis removes the emotional stress of "timing the market" and ensures you buy more when prices are low and less when they are high.',
        funFact: 'DCA is one of the most effective strategies for long-term wealth building due to its simplicity.',
        visualData: { type: 'stock-sim' }
      },
      {
        id: 'term-2-3',
        title: 'Step 3: Banks',
        content: 'Not all banks are the same:\n- **Central Bank**: Manages the nation\'s money supply and interest rates (e.g., The Fed).\n- **Commercial Bank**: Where you keep your checking and savings accounts.\n- **Investment Bank**: Helps corporations raise massive capital through IPOs.',
        funFact: 'The Bank of England, founded in 1694, is one of the oldest central banks in the world!',
        visualData: {
          type: 'icon-group',
          items: [
            { icon: 'Building2', label: 'Central Bank', info: 'Sets the rules and interest rates for the whole economy.' },
            { icon: 'Wallet', label: 'Commercial', info: 'Handles everyday banking, loans, and deposits for the public.' },
            { icon: 'Zap', label: 'Investment', info: 'Specializes in large-scale corporate finance and mergers.' }
          ]
        }
      },
      {
        id: 'term-2-4',
        title: 'Step 4: Broker',
        content: 'A **Broker** is your bridge to the financial markets. They are the intermediary platform or person that executes your buy and sell orders in exchange for commissions or fees.\n\nToday, most retail brokers are digital apps that offer commission-free trading to attract individuals.',
        funFact: 'The word "Broker" comes from Old French "broceur," meaning a "small trader."',
        visualData: {
          type: 'icon-group',
          items: [
            { icon: 'Smartphone', label: 'Retail App', info: 'User-friendly mobile platforms like Robinhood or E*TRADE.' },
            { icon: 'Activity', label: 'Execution', info: 'The process of matching your buy order with a seller.' },
            { icon: 'Coins', label: 'Fees', info: 'Commissions, spreads, or subscription fees charged for service.' }
          ]
        }
      },
      {
        id: 'term-2-5',
        title: 'Step 5: Economic Cycle',
        content: 'Economies move in cycles:\n- **Expansion**: Period of growth, high employment, and rising stock prices.\n- **Recession**: Period of contraction, job losses, and falling prices.\n\nA recession is technically defined as two consecutive quarters of negative GDP growth.',
        funFact: 'The average US economic expansion lasts about 5 years, while the average recession lasts 11 months.',
        visualData: {
           type: 'sentiment-sim',
           label: 'Economic Cycle Monitor',
           labels: ['Expansion', 'Recession'],
           statuses: ['PROSPERITY & GROWTH', 'DOWNTURN & CONTRACTION']
        }
      },
      {
        id: 'term-2-6',
        title: 'Step 6: Valuation',
        content: '**Valuation** is the process of determining the "true" value of an asset. Analysts look for **Intrinsic Value** to see if a stock is overpriced or a bargain.\n\nIf the market price is lower than the intrinsic value, the asset is considered "Undervalued."',
        funFact: 'Warren Buffett often calls valuation "the art of buying a dollar for forty cents."',
        visualData: {
          type: 'icon-group',
          items: [
            { icon: 'Search', label: 'Analysis', info: 'Checking earnings, debts, and growth potential.' },
            { icon: 'ShieldCheck', label: 'Intrinsic Value', info: 'What the asset is "really" worth based on data.' },
            { icon: 'TrendingDown', label: 'Undervalued', info: 'When the market price is a bargain.' }
          ]
        }
      },
      {
        id: 'term-2-7',
        title: 'Step 7: Volume',
        content: '**Volume** is the total number of shares or units of an asset traded over a specific period. \n\nHigh volume confirms that many people are interested in a price move, making it more significant. Low volume can mean a move is weak and lack support.',
        funFact: 'On a typical day, billions of shares are traded on the New York Stock Exchange!',
        visualData: { 
          type: 'bar-chart', 
          label: 'Trading Volume (Daily)',
          data: [
            { name: 'Mon', value: 120 },
            { name: 'Tue', value: 450 },
            { name: 'Wed', value: 310 },
            { name: 'Thu', value: 980 },
            { name: 'Fri', value: 550 }
          ] 
        }
      }
    ],
    quiz: [
      {
        question: 'What does Leverage mean in investing?',
        type: 'MCQ',
        options: [
          'Using borrowed capital to increase position size.',
          'Spreading investments across asset classes.',
          'A fee charged for holding overnight.',
          'The minimum deposit required.'
        ],
        correctAnswer: 0,
        explanation: 'Leverage lets you trade with "other people\'s money" to boost potential returns, but it also increases risk.'
      },
      {
        question: 'What is Dollar-Cost Averaging (DCA)?',
        type: 'MCQ',
        options: [
          'Investing a fixed amount at regular intervals regardless of price.',
          'Investing all capital at once.',
          'Only buying at all-time lows.',
          'Splitting portfolio equally across assets.'
        ],
        correctAnswer: 0,
        explanation: 'DCA reduces the risk of "timing the market" by smoothing out your entry price.'
      },
      {
        question: 'Which type of bank focuses on helping companies raise capital via IPOs?',
        type: 'MCQ',
        options: ['Investment Bank', 'Commercial Bank', 'Central Bank', 'Retail Bank'],
        correctAnswer: 0,
        explanation: 'Investment banks act as advisors and facilitators for corporations entering the public markets.'
      },
      {
        question: 'What is a broker, and what do they do?',
        type: 'MCQ',
        options: [
          'An intermediary executing buy and sell orders for a fee.',
          'A government body regulating markets.',
          'An analyst predicting future prices.',
          'A company issuing new shares.'
        ],
        correctAnswer: 0,
        explanation: 'Brokers connect buyers and sellers in the financial markets.'
      },
      {
        question: 'What is the technical definition of a recession?',
        type: 'MCQ',
        options: [
          'Two consecutive quarters of negative GDP growth.',
          'The stock market falling by 20%.',
          'Inflation reaching above 10%.',
          'The central bank raising interest rates twice.'
        ],
        correctAnswer: 0,
        explanation: 'A recession is a broad economic contraction measured by declining production (GDP).'
      },
      {
        question: 'If a stock’s market price is lower than its intrinsic value, it is:',
        type: 'MCQ',
        options: ['Undervalued', 'Overpriced', 'At Fair Value', 'Liquidated'],
        correctAnswer: 0,
        explanation: 'Finding undervalued assets is a core goal of value investing.'
      },
      {
        question: 'How does Volume affect the significance of a price move?',
        type: 'MCQ',
        options: [
          'High volume suggests strong interest and validates the move.',
          'Low volume makes a move more reliable.',
          'Volume has no impact on price movement.',
          'Volume only matters for Bonds, not Stocks.'
        ],
        correctAnswer: 0,
        explanation: 'High volume indicates conviction among market participants.'
      }
    ]
  },
  // --- SECTION 3: ANALYSIS ---
  {
    id: 'analysis-1',
    section: 'Analysis',
    category: 'Value',
    title: 'Unit 1: Fundamental Analysis',
    description: 'Learning to find the "True Value" of a company.',
    content: 'Fundamental Analysis is like being a detective. Your job is to find what a company is really worth.',
    xpReward: 700,
    articleUrl: 'https://www.investopedia.com/terms/f/fundamentalanalysis.asp',
    subTopics: [
      {
        id: 'anal-1-1',
        title: 'Step 1: Intrinsic Value',
        content: 'FA measures the **Intrinsic Value** of an asset by examining related economic and financial factors. If market price is < Intrinsic Value, it might be a bargain!',
        funFact: 'Warren Buffett is the most famous fundamental investor, often buying companies based on their long-term value.'
      },
      {
        id: 'anal-1-2',
        title: 'Step 2: The Three Statements',
        content: 'To analyze a company, you need its "Report Card":\n1. **Income Statement**: Profit/Loss over a period.\n2. **Balance Sheet**: A snapshot of what it owns (**Assets**) and what it owes (**Liabilities**).\n3. **Cash Flow Statement**: Actual money moving in/out.\n\nWe analyze the **Balance Sheet** to assess a company\'s financial health by reviewing assets, liabilities, and shareholder equity.',
        quickQuestion: {
          question: 'Which statement shows a company\'s debt and assets at a specific point in time?',
          type: 'MCQ',
          options: ['Balance Sheet', 'Income Statement', 'Cash Flow'],
          correctAnswer: 0,
          explanation: 'The Balance Sheet is a snapshot of financial health.'
        }
      },
      {
        id: 'anal-1-3',
        title: 'Step 3: Interest Rates',
        content: '**Interest Rates** are the "rent" paid for borrowing money. Usually set by a country\'s Central Bank (like the Fed in the US), they determine the cost of loans, mortgages, and business expansion.\n\n- **High Rates**: Discourage borrowing, slow down the economy, and can lower inflation.\n- **Low Rates**: Encourage borrowing, boost spending, but can lead to high inflation.',
        funFact: 'When interest rates rise, bond prices typically fall. They have an "inverse" relationship!',
        visualData: { 
          type: 'bar-chart', 
          label: 'Interest Rate Trends (%)',
          data: [
            { name: '2021', value: 0.25 },
            { name: '2022', value: 2.5 },
            { name: '2023', value: 5.25 },
            { name: '2024', value: 5.5 }
          ] 
        }
      },
      {
        id: 'anal-1-4',
        title: 'Step 4: Inflation Rates',
        content: '**Inflation** is the rate at which the general level of prices for goods and services is rising. As inflation rises, every dollar you own buys a smaller percentage of a good or service.\n\nCentral banks usually target a **2%** inflation rate. If it gets too high (like 8-9%), the economy can become unstable.',
        funFact: 'In 1920s Germany, inflation was so bad that people used wheelbarrows of money just to buy a loaf of bread!',
        visualData: {
          type: 'icon-group',
          items: [
            { icon: 'Coins', label: 'Cash Value', info: 'Inflation erodes the value of savings over time.' },
            { icon: 'ShoppingCart', label: 'Goods', info: 'Prices of groceries and gas typically rise first.' },
            { icon: 'Activity', label: 'Purchasing Power', info: 'Your $1 buys less today than it did yesterday.' }
          ]
        }
      },
      {
        id: 'anal-1-5',
        title: 'Step 5: Unemployment Rates',
        content: 'The **Unemployment Rate** measures the percentage of the workforce that is jobless and actively looking for work. It is a lagging indicator, meaning it changes after the economy has already started a trend.\n\n- **Low Unemployment**: Strong economy, high consumer spending.\n- **High Unemployment**: Weak economy, lower spending, potential recession.',
        funFact: 'During the 2020 pandemic, US unemployment spiked to nearly 15% in just two months!',
        visualData: { 
          type: 'bar-chart', 
          label: 'Employment Status (%)',
          data: [
            { name: 'Jobs', value: 96 },
            { name: 'Jobless', value: 4 }
          ] 
        }
      },
      {
        id: 'anal-1-6',
        title: 'Step 6: GDP (Output)',
        content: '**GDP** is the "Scorecard" of a country\'s economic health. It represents the total value of all goods and services produced over a specific period.\n\nPositive GDP growth means the economy is expanding. Two consecutive quarters of negative growth is the technical definition of a **Recession**.',
        funFact: 'The United States has the largest GDP in the world, currently exceeding $25 Trillion!',
        visualData: {
          type: 'bar-chart',
          label: 'Quarterly GDP Growth (%)',
          data: [
            { name: 'Q1', value: 2.1 },
            { name: 'Q2', value: 1.5 },
            { name: 'Q3', value: -0.5 },
            { name: 'Q4', value: -1.2 }
          ]
        }
      },
      {
        id: 'anal-1-7',
        title: 'Step 7: CPI (Price Index)',
        content: '**CPI** is the most widely used measure of inflation. It tracks the price changes of a "basket of goods" that an average consumer buys, including food, energy, and housing.\n\nTraders watch CPI data closely because it directly influences whether the Central Bank will change interest rates.',
        funFact: "The CPI 'basket' is updated every few years. It now includes things like streaming services and smartphones which didn't exist 30 years ago!",
        visualData: {
          type: 'bar-chart',
          label: 'CPI Component Growth (%)',
          data: [
            { name: 'Food', value: 3.2 },
            { name: 'Energy', value: -1.5 },
            { name: 'Housing', value: 5.4 },
            { name: 'Travel', value: 2.1 }
          ]
        }
      },
      {
        id: 'anal-1-8',
        title: 'Step 8: NFP (Payroll Data)',
        content: '**NFP** is arguably the most influential monthly economic report. It measures the number of workers added in the US (excluding farm workers, government, and non-profits).\n\nIt is released on the first Friday of every month. A "High NFP" (more jobs) usually strengthens the local currency.',
        funFact: 'The NFP release often causes the highest price volatility of the entire month in the Forex and Stock markets!',
        visualData: {
          type: 'icon-group',
          items: [
            { icon: 'Users', label: 'Job Growth', info: 'Positive numbers indicate an expanding labor market.' },
            { icon: 'Zap', label: 'Volatility', info: 'Markets react violently within seconds of this data release.' },
            { icon: 'Building', label: 'Economy', info: 'NFP is a primary health check for the US economy.' }
          ]
        }
      },
      {
        id: 'anal-1-9',
        title: 'Step 9: FOMC (Policy Meetings)',
        content: 'The **FOMC** meets 8 times a year to discuss the economy and set interest rates. Their statements are parsed word-by-word by traders searching for clues about future policy.\n\n- **Hawkish**: Leaning towards higher rates (fighting inflation).\n- **Dovish**: Leaning towards lower rates (supporting growth).',
        funFact: 'The "Fed Chair" (currently Jerome Powell) is often considered the most powerful person in global finance!',
        visualData: {
          type: 'sentiment-sim',
          label: 'FOMC Policy Stance',
          labels: ['Hawkish', 'Dovish'],
          statuses: ['FIGHTING INFLATION', 'SUPPORTING GROWTH']
        }
      },
      {
        id: 'anal-1-10',
        title: 'Step 10: Valuation & DCF',
        content: '**Undervalued**: When a stock trades below its intrinsic value.\n**DCF Model (Discounted Cash Flow)**: A method that projects future free cash flows and discounts them back to the present day to determine intrinsic value.\n\nFundamental analysis includes **quantitative** (numbers), **qualitative** (management), **political**, and **economic** elements.',
        visualData: { 
          type: 'icon-group', 
          items: [
            { icon: 'BarChart', label: 'Quantitative', info: 'Earnings, revenue, and cash flow data.' },
            { icon: 'Users', label: 'Qualitative', info: 'Brand strength and management quality.' },
            { icon: 'Globe', label: 'Macro', info: 'Politics and global economic trends.' }
          ]
        }
      }
    ],
    quiz: [
      {
        question: 'What is Fundamental Analysis?',
        type: 'MCQ',
        options: [
          'Evaluating assets by measuring their intrinsic value.',
          'Predicting price by studying chart patterns.',
          'Measuring how quickly an asset can be sold.',
          'Tracking daily trading volume.'
        ],
        correctAnswer: 0,
        explanation: 'Fundamentalists look at the business, not just the chart.'
      },
      {
        question: 'What are some aspects included within Fundamental Analysis?',
        type: 'MCQ',
        options: [
          'Quantitative, qualitative, political, and economic elements.',
          'Short-term technical indicators like RSI.',
          'Candlestick patterns within charts.',
          'Solely a country’s imports and exports.'
        ],
        correctAnswer: 0,
        explanation: 'FA is a holistic approach considering internal and external variables.'
      },
      {
        question: 'What does it mean when a stock is considered "undervalued"?',
        type: 'MCQ',
        options: [
          'The stock is trading below its intrinsic value.',
          'The stock has declined 20% from a peak.',
          'The company reported negative earnings.',
          'The stock price equals its book value.'
        ],
        correctAnswer: 0,
        explanation: 'Undervalued stocks suggest a potential buying opportunity.'
      },
      {
        question: 'What are the 3 most crucial financial statements? (List them)',
        type: 'WQ',
        correctAnswer: 'Balance Sheet, Income Statement, Cash Flow Statement',
        explanation: 'These three documents provide a complete picture of a company\'s financial reality.'
      },
      {
        question: 'Why do we analyze a company’s Balance Sheet?',
        type: 'MCQ',
        options: [
          'To review assets, liabilities, and shareholder equity.',
          'To track daily price movement.',
          'To count the total shares traded.',
          'To compare stock price against competitors.'
        ],
        correctAnswer: 0,
        explanation: 'The Balance Sheet shows the financial structure and solvency of a business.'
      },
      {
        question: 'Name 3 examples of economic indicators covered in this lesson.',
        type: 'WQ',
        correctAnswer: 'Interest Rates, Inflation Rates, Unemployment Rates, GDP, CPI, NFP, FOMC',
        explanation: 'Common indicators include GDP, CPI (Inflation), and Interest Rates.'
      },
      {
        question: 'What is the Discounted Cash Flow (DCF) model?',
        type: 'MCQ',
        options: [
          'Projecting future cash flows and discounting them to the present.',
          'Valuation based solely on past history.',
          'Calculating net profit using accounting income.',
          'Ignoring time-value of money for nominal flows.'
        ],
        correctAnswer: 0,
        explanation: 'DCF is a gold standard for professional valuation of businesses.'
      }
    ]
  },
  {
    id: 'analysis-2',
    section: 'Analysis',
    category: 'Charts',
    title: 'Unit 2: Technical Analysis',
    description: 'The art of reading price charts and patterns.',
    content: 'Technical analysis assumes that "Price tells the story." You study the chart to find high-probability setups.',
    xpReward: 700,
    articleUrl: 'https://www.investopedia.com/terms/t/technicalanalysis.asp',
    subTopics: [
      {
        id: 'anal-2-1',
        title: 'Step 1: Support and Resistance',
        content: '**Support (Floor)**: A price level where demand is strong enough to stop a drop. Price tends to bounce upward at support because buyers see value.\n**Resistance (Ceiling)**: A price level where supply is strong enough to stop a rally.',
        funFact: 'Charts are essentially a battleground where we can see the psychology of thousands of traders at once.',
        visualData: { type: 'chart-line', labels: ['Ceiling', 'Floor'], data: [150, 100] }
      },
      {
        id: 'anal-2-2',
        title: 'Step 2: Trends and Movements',
        content: '**Consolidation (Range)** happens when price moves sideways between support and resistance.\n**Breakout (Rally)** occurs when price breaks through resistance, often leading to a sharp move up.\n**Breakdown (Drop)** occurs when price breaks below support.',
        funFact: 'Many traders wait for a breakout from a long consolidation period, as it often signals the start of a massive trend!'
      },
      {
        id: 'anal-2-3',
        title: 'Step 3: Supply, Demand & Volume',
        content: '**Supply** refers to selling pressure (Resistance), while **Demand** refers to buying pressure (Support).\nHigh trading **Volume** confirms the strength behind a price move. High volume on a breakout suggests genuine momentum.',
        visualData: { type: 'icon-group', items: [{ icon: 'ArrowUp', label: 'Demand', info: 'Buying pressure' }, { icon: 'ArrowDown', label: 'Supply', info: 'Selling pressure' }] }
      },
      {
        id: 'anal-2-4',
        title: 'Step 4: Indicators & Probabilities',
        content: 'A **Golden Cross** is a bullish signal where a short-term moving average (e.g. 50-day) crosses above a long-term (e.g. 200-day). Conversely, a **Death Cross** is a bearish signal where the short-term average crosses below the long-term.\n\nRemember: Technical Analysis is about **probabilities**, not certainties. Indicators provide clues, but external news and market shifts can always override chart signals.',
        visualData: { type: 'crossover' }
      }
    ],
    quiz: [
      {
        question: 'What is Technical Analysis?',
        type: 'MCQ',
        options: [
          'Evaluating assets by analyzing price trends and statistics.',
          'Assessing financial statements to find value.',
          'Measuring company profitability.',
          'Evaluating macroeconomic indicators.'
        ],
        correctAnswer: 0,
        explanation: 'Technical analysts focus on price action and chart patterns.'
      },
      {
        question: 'What is Supply and Demand in Technical Analysis?',
        type: 'MCQ',
        options: [
          'Supply is selling pressure (Resistance); Demand is buying pressure (Support).',
          'Supply is total shared issued; Demand is investor count.',
          'Only applies to commodities.',
          'Supply is revenue; Demand is consumer interest.'
        ],
        correctAnswer: 0,
        explanation: 'Price equilibrium is determined by the balance of supply and demand.'
      },
      {
        question: 'What does a “Golden Cross” mean in Technical Analysis?',
        type: 'MCQ',
        options: [
          'A short-term moving average crosses above a long-term moving average.',
          'Price reaches an all-time high 3 days in a row.',
          'A bearish signal indicating a downtrend.',
          'RSI crosses above 70.'
        ],
        correctAnswer: 0,
        explanation: 'A Golden Cross is one of the most widely followed bullish indicators.'
      },
      {
        question: 'How does price normally react when approaching a price level of Support?',
        type: 'MCQ',
        options: [
          'Price tends to bounce upward as buyers step in.',
          'Price always breaks through and continues falling.',
          'Price immediately spikes to a new all-time high.',
          'Price freezes until news occurs.'
        ],
        correctAnswer: 0,
        explanation: 'Support acts as a "floor" where demand exceeds supply.'
      },
      {
        question: 'What does high trading Volume typically signal when accompanied by a strong price move?',
        type: 'MCQ',
        options: [
          'It confirms the strength and conviction behind the move.',
          'It signals an immediate reversal.',
          'It means institutions are exiting.',
          'It indicates the asset is overvalued.'
        ],
        correctAnswer: 0,
        explanation: 'Volume validates the trend; higher volume means higher participation.'
      },
      {
        question: 'Match these terms with their similar meanings.',
        type: 'MQ',
        pairs: [
          { left: 'Consolidation', right: 'Range' },
          { left: 'Breakout', right: 'Rally' },
          { left: 'Breakdown', right: 'Drop' },
          { left: 'Support', right: 'Floor' },
          { left: 'Resistance', right: 'Ceiling' }
        ],
        explanation: 'Understanding synonyms helps you read analyst reports more clearly.'
      },
      {
        question: 'What should every investor keep in mind when using Technical Analysis?',
        type: 'MCQ',
        options: [
          'It is based on probability and historical patterns, not certainty.',
          'It is 100% accurate with enough indicators.',
          'No other information is needed if the pattern is clear.',
          'It eliminates all risk.'
        ],
        correctAnswer: 0,
        explanation: 'The market can always behave unexpectedly regardless of what the charts say.'
      }
    ]
  }
];

export const INITIAL_BALANCE = 100000; // $100k paper money

export const MOCK_PRICES: Record<string, number> = {
  'BTCUSD': 65000,
  'ETHUSD': 3500,
  'SOLUSD': 140,
  'BNBUSD': 580,
  'AAPL': 175,
  'TSLA': 170,
  'NVDA': 850,
  'MSFT': 420,
  'GOOGL': 150,
  'AMZN': 180,
  'META': 490,
  'NFLX': 600,
  'AMD': 180,
  'PYPL': 65
};

export const GAME_SCENARIOS = {
  bullRun: [
    { id: 1, difficulty: 'beginner', event: "Sudden market rally! Tech stocks are surging.", type: 'bull', options: ["Sell", "Buy More", "Hold"], correct: 1, explanation: "In a rally, 'Buy More' is aggressive but fits the momentum strategy. 'Hold' is safe, but 'Sell' limits upside." },
    { id: 2, difficulty: 'beginner', event: "Rumors of a trade war. Volatility is rising.", type: 'bear', options: ["Double Down", "Set Stop Loss", "Panic Sell"], correct: 1, explanation: "Setting a Stop Loss protects your capital without exiting too early if it's just a rumor." },
    { id: 3, difficulty: 'beginner', event: "Company announces record earnings.", type: 'bull', options: ["Hold", "Sell all", "Set Trailing Stop"], correct: 2, explanation: "A trailing stop locks in profits while allowing for further upside." },
    { id: 4, difficulty: 'beginner', event: "Central bank raises interest rates unexpectedly.", type: 'bear', options: ["Wait for dip", "Sell", "Hold"], correct: 1, explanation: "Rate hikes are generally bad for stocks; selling quickly can prevent major drawdowns." },
    { id: 5, difficulty: 'proficient', event: "Market reaches an all-time high resistance level.", type: 'neutral', options: ["Full Send", "Take Partial Profits", "Short"], correct: 1, explanation: "Taking partial profits at resistance is a hallmarks of professional risk management." },
    { id: 6, difficulty: 'proficient', event: "General market correction of 10% in a week.", type: 'bear', options: ["Exit All", "Buy the Dip", "Wait for Base"], correct: 2, explanation: "Trying to catch a falling knife is risky. Waiting for the market to form a 'base' (sideways movement) is safer." },
    { id: 7, difficulty: 'proficient', event: "A major tech CEO resigns suddenly.", type: 'neutral', options: ["Buy call options", "Wait for reaction", "Sell immediately"], correct: 1, explanation: "Knee-jerk reactions often lead to bad trades. Wait to see how the market absorbs the news." },
    { id: 8, difficulty: 'proficient', event: "CPI data shows inflation is cooling down.", type: 'bull', options: ["Hold", "Short stocks", "Sell for profit"], correct: 0, explanation: "Cooling inflation often leads the Fed to pause or cut rates, which is bullish for equities." },
    { id: 9, difficulty: 'expert', event: "Your stock hits your preset target price.", type: 'neutral', options: ["Stick to plan (Sell)", "Move target higher", "Ignore it"], correct: 0, explanation: "Emotional greed often causes traders to lose profits. Stick to your exit plan." },
    { id: 10, difficulty: 'expert', event: "Social media hype drives a 'meme stock' up 300%.", type: 'neutral', options: ["FOMO Buy", "Watch from sidelines", "Short it"], correct: 1, explanation: "Chasing parabolic moves is the easiest way to lose 50% in minutes. Watching from the sidelines is often the wisest pro move." },
    { id: 11, difficulty: 'expert', event: "Earnings season begins: Banks reporting better than expected.", type: 'bull', options: ["Buy SPY", "Sell Bank Stocks", "Go Cash"], correct: 0, explanation: "Strong financial sector performance often leads the broader market higher." },
    { id: 12, difficulty: 'expert', event: "Oil prices spike due to geopolitical tension.", type: 'bear', options: ["Buy Airlines", "Buy Energy Stocks", "Sell All"], correct: 1, explanation: "Energy sector usually benefits from oil spikes, while consumer/transport stocks suffer." }
  ],
  chartMaster: [
    {
      id: 1,
      difficulty: 'beginner',
      type: 'pattern',
      question: "Identify the 'Double Top' pattern.",
      points: [{ x: 50, y: 30, label: "Top 1" }, { x: 150, y: 30, label: "Top 2" }],
      chartData: [100, 120, 80, 120, 85, 60]
    },
    {
      id: 2,
      difficulty: 'beginner',
      type: 'trend',
      question: "Where is the Support level?",
      points: [{ x: 100, y: 150, label: "Support" }],
      chartData: [150, 120, 150, 110, 150, 140]
    },
    {
      id: 3,
      difficulty: 'beginner',
      type: 'pattern',
      question: "Spot the 'Head and Shoulders' neckline.",
      points: [{ x: 100, y: 120, label: "Neckline" }],
      chartData: [100, 140, 110, 160, 110, 140, 110, 80]
    },
    {
      id: 4,
      difficulty: 'beginner',
      type: 'trend',
      question: "Where is the Resistance level?",
      points: [{ x: 50, y: 50, label: "Resistance" }, { x: 150, y: 50, label: "Resistance" }],
      chartData: [50, 80, 55, 80, 45, 90]
    },
    {
      id: 5,
      difficulty: 'proficient',
      type: 'pattern',
      question: "Find the 'Bull Flag' consolidation zone.",
      points: [{ x: 120, y: 80, label: "Flag" }],
      chartData: [80, 150, 140, 145, 135, 140, 180]
    },
    {
      id: 6,
      difficulty: 'proficient',
      type: 'pattern',
      question: "Identify the 'Ascending Triangle' resistance.",
      points: [{ x: 100, y: 50, label: "Resistance" }, { x: 180, y: 50, label: "Resistance" }],
      chartData: [100, 50, 110, 50, 120, 50, 140]
    },
    {
      id: 7,
      difficulty: 'proficient',
      type: 'pattern',
      question: "Spot the 'Double Bottom' W-shape base.",
      points: [{ x: 50, y: 150, label: "Bottom 1" }, { x: 150, y: 150, label: "Bottom 2" }],
      chartData: [100, 150, 120, 150, 180]
    },
    {
      id: 8,
      difficulty: 'expert',
      type: 'trend',
      question: "Where is the 'Breakout' point?",
      points: [{ x: 140, y: 60, label: "Breakout" }],
      chartData: [100, 100, 100, 100, 80, 60, 40]
    },
    {
      id: 9,
      difficulty: 'expert',
      type: 'pattern',
      question: "Find the 'Cup and Handle' handle.",
      points: [{ x: 160, y: 80, label: "Handle" }],
      chartData: [150, 100, 80, 100, 150, 140, 160]
    },
    {
      id: 10,
      difficulty: 'expert',
      type: 'trend',
      question: "Identify the 'Gap Up' zone.",
      points: [{ x: 100, y: 80, label: "Gap" }],
      chartData: [120, 110, 100, 60, 50, 40]
    }
  ],
  whaleWatch: [
    {
      id: 1,
      difficulty: 'beginner',
      event: "Massive volume spike detected. Price is stable. What do you do?",
      options: ["Accumulation (Follow)", "Wait for breakout", "Exit position"],
      correct: 0,
      explanation: "Large volume at stable price often means 'whales' are accumulating. Following them early is a pro move."
    },
    {
      id: 2,
      difficulty: 'beginner',
      event: "Large 'sell wall' appears on the order book.",
      options: ["Panic Sell", "Wait for absorption", "Set Sell Order below"],
      correct: 1,
      explanation: "Whales use sell walls to suppress price while they buy. Waiting to see if it gets absorbed is key."
    },
    {
      id: 3,
      difficulty: 'beginner',
      event: "Exchange inflows of stablecoins hit record highs.",
      options: ["Bearish (Selling)", "Bullish (Buying Power)", "Neutral"],
      correct: 1,
      explanation: "Stablecoins moving to exchanges usually signals that 'whales' are preparing to buy assets."
    },
    {
      id: 4,
      difficulty: 'proficient',
      event: "A 'Cold Wallet' dormant since 2011 moves 50,000 BTC to an exchange.",
      options: ["Bullish (Old hands holding)", "Bearish (Selling Pressure)", "Neutral"],
      correct: 1,
      explanation: "Large amounts of dormant assets moving to exchanges usually indicates an intent to sell, creating massive pressure."
    },
    {
      id: 5,
      difficulty: 'proficient',
      event: "Order book spoofing: Massive buy orders appear and disappear instantly.",
      options: ["FOMO Buy", "Watch for Trap", "Short immediately"],
      correct: 1,
      explanation: "Spoofing is used to create a false sense of demand. Pros wait for actual execution rather than reacting to 'ghost' orders."
    },
    {
      id: 6,
      difficulty: 'proficient',
      event: "Whale Alert: 1 Billion USDT minted at Tether Treasury.",
      options: ["Bullish (Dry Powder)", "Bearish (Inflation)", "Neutral"],
      correct: 0,
      explanation: "New stablecoins being minted often lead to increased buying power in the crypto markets."
    },
    {
      id: 7,
      difficulty: 'expert',
      event: "Short Squeeze Potential: Liquidations clustering just above current price.",
      options: ["Sell before crash", "Buy breakout", "Hold through volatility"],
      correct: 1,
      explanation: "If whales drive price into a liquidation cluster, it forces shorts to buy, creating a parabolic move up."
    },
    {
      id: 8,
      difficulty: 'expert',
      event: "Divergence: RSI is making higher lows while price makes lower lows.",
      options: ["Bearish Trend", "Bullish Divergence", "Trend is friend"],
      correct: 1,
      explanation: "Bullish divergence often signals that selling momentum is fading despite lower prices. Whales often accumulate here."
    },
    {
      id: 9,
      difficulty: 'expert',
      event: "Dark Pool activity: Institutional size blocks trading off-exchange.",
      options: ["Ignore it", "Wait for secondary move", "Follow immediately"],
      correct: 1,
      explanation: "Dark pools hide massive trades. When the effect hits the public order book, it usually follows the institutional direction."
    },
    {
      id: 10,
      difficulty: 'expert',
      event: "Open Interest (OI) spikes while price remains in a tight range.",
      options: ["Low Volatility", "Fuel for Explosive Move", "Market is bored"],
      correct: 1,
      explanation: "High OI means lots of leverage. A small price move can trigger a chain reaction (long or short squeeze)."
    }
  ]
};
