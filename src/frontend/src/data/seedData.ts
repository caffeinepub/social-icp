import type {
  DirectMessage,
  Notification,
  Post,
  StatusUpdate,
  Story,
  UserProfile,
} from "../backend.d";

const now = BigInt(Date.now()) * 1_000_000n;
const hour = 3_600_000_000_000n;
const min = 60_000_000_000n;

export const SEED_USERS: UserProfile[] = [
  {
    id: 1n,
    username: "nova_creator",
    displayName: "Nova Chen",
    bio: "Digital artist & ICP enthusiast. Building the decentralized future one pixel at a time. 🎨✨",
    followers: [2n, 3n, 4n],
    following: [2n, 5n],
    followPrice: 0n,
    principalId: "rdmx6-jaaaa-aaaaa-aaadq-cai" as any,
    avatar: undefined,
  },
  {
    id: 2n,
    username: "cryptodev_42",
    displayName: "Marcus Webb",
    bio: "Full-stack dev on the IC. Motoko ♾️ Rust enthusiast. Open source contributor.",
    followers: [1n, 3n],
    following: [1n, 4n],
    followPrice: 100_000_000n, // 1 ICP
    principalId: "rrkah-fqaaa-aaaaa-aaaaq-cai" as any,
    avatar: undefined,
  },
  {
    id: 3n,
    username: "defi_queen",
    displayName: "Zara Patel",
    bio: "DeFi researcher & tokenomics nerd. ICP maximalist. Ask me about DAOs 🏛️",
    followers: [1n, 2n, 4n, 5n],
    following: [1n, 2n],
    followPrice: 50_000_000n, // 0.5 ICP
    principalId: "rno2w-sqaaa-aaaaa-aaacq-cai" as any,
    avatar: undefined,
  },
  {
    id: 4n,
    username: "ic_photographer",
    displayName: "Leo Santos",
    bio: "Photographer | Visual storyteller | Capturing moments on the blockchain 📸",
    followers: [1n, 2n],
    following: [1n, 3n],
    followPrice: 0n,
    principalId: "r7inp-6aaaa-aaaaa-aaabq-cai" as any,
    avatar: undefined,
  },
  {
    id: 5n,
    username: "web3_alice",
    displayName: "Alice Moon",
    bio: "Building on ICP since genesis. NFT creator. Coffee ☕ & code.",
    followers: [3n],
    following: [1n, 3n],
    followPrice: 0n,
    principalId: "qaa6y-5yaaa-aaaaa-aaafa-cai" as any,
    avatar: undefined,
  },
];

export const SEED_POSTS: Post[] = [
  {
    id: 1n,
    content:
      "Just deployed my first NFT marketplace on the #InternetComputer! The speed is incredible — sub-second finality with no gas fees. This is the future of #Web3 🚀",
    author: "rdmx6-jaaaa-aaaaa-aaadq-cai" as any,
    likes: [
      "rrkah-fqaaa-aaaaa-aaaaq-cai" as any,
      "rno2w-sqaaa-aaaaa-aaacq-cai" as any,
      "r7inp-6aaaa-aaaaa-aaabq-cai" as any,
    ],
    timestamp: now - 2n * hour,
    image: undefined,
    comments: [
      {
        id: 1n,
        commenter: "rrkah-fqaaa-aaaaa-aaaaq-cai" as any,
        text: "Congrats! Drop the link, I want to check it out! 🔥",
        timestamp: now - hour,
      },
      {
        id: 2n,
        commenter: "rno2w-sqaaa-aaaaa-aaacq-cai" as any,
        text: "The IC really is a game changer for NFTs. No more Ethereum gas nightmares!",
        timestamp: now - 30n * min,
      },
    ],
  },
  {
    id: 2n,
    content:
      "Golden hour in the city 🌅 Some days you just need to step back and appreciate the beauty around you. Shot this on my way home from the ICP hackathon. #Photography #GoldenHour #ICP",
    author: "r7inp-6aaaa-aaaaa-aaabq-cai" as any,
    likes: [
      "rdmx6-jaaaa-aaaaa-aaadq-cai" as any,
      "qaa6y-5yaaa-aaaaa-aaafa-cai" as any,
    ],
    timestamp: now - 4n * hour,
    image: undefined,
    comments: [
      {
        id: 3n,
        commenter: "qaa6y-5yaaa-aaaaa-aaafa-cai" as any,
        text: "Stunning photo! What camera do you use? 😍",
        timestamp: now - 3n * hour,
      },
    ],
  },
  {
    id: 3n,
    content:
      "Deep dive into #DeFi tokenomics: Why deflationary models on the IC outperform traditional models by 340% over 12 months. Thread 🧵👇\n\n1/ The key insight is that IC's reverse gas model fundamentally changes incentive structures...",
    author: "rno2w-sqaaa-aaaaa-aaacq-cai" as any,
    likes: [
      "rdmx6-jaaaa-aaaaa-aaadq-cai" as any,
      "rrkah-fqaaa-aaaaa-aaaaq-cai" as any,
      "r7inp-6aaaa-aaaaa-aaabq-cai" as any,
      "qaa6y-5yaaa-aaaaa-aaafa-cai" as any,
    ],
    timestamp: now - 6n * hour,
    image: undefined,
    comments: [],
  },
  {
    id: 4n,
    content:
      "New #Motoko tutorial: Building a social media canister from scratch. The code is surprisingly clean — pattern matching makes state management a breeze! Check the link in bio for the full guide. #ICP #Blockchain",
    author: "rrkah-fqaaa-aaaaa-aaaaq-cai" as any,
    likes: [
      "rdmx6-jaaaa-aaaaa-aaadq-cai" as any,
      "rno2w-sqaaa-aaaaa-aaacq-cai" as any,
    ],
    timestamp: now - 8n * hour,
    image: undefined,
    comments: [
      {
        id: 4n,
        commenter: "rdmx6-jaaaa-aaaaa-aaadq-cai" as any,
        text: "Love your tutorials! This one is especially helpful 🙏",
        timestamp: now - 7n * hour,
      },
    ],
  },
];

export const SEED_STORIES: Story[] = [
  {
    id: 1n,
    content:
      "Just minted my 100th NFT on ICP! 🎉 Celebrating with the community!",
    author: "rdmx6-jaaaa-aaaaa-aaadq-cai" as any,
    timestamp: now - hour,
  },
  {
    id: 2n,
    content:
      "Live coding session starting in 10 mins — building a DAO on Internet Computer. Join!",
    author: "rrkah-fqaaa-aaaaa-aaaaq-cai" as any,
    timestamp: now - 2n * hour,
  },
  {
    id: 3n,
    content:
      "New research paper out: 'Tokenomics of the Internet Computer' — read it before everyone else!",
    author: "rno2w-sqaaa-aaaaa-aaacq-cai" as any,
    timestamp: now - 3n * hour,
  },
  {
    id: 4n,
    content:
      "Behind the scenes at the ICP hackathon — the energy here is electric! 📸",
    author: "r7inp-6aaaa-aaaaa-aaabq-cai" as any,
    timestamp: now - 4n * hour,
  },
  {
    id: 5n,
    content:
      "Coffee ☕ + code = magic. Working on something big... stay tuned!",
    author: "qaa6y-5yaaa-aaaaa-aaafa-cai" as any,
    timestamp: now - 5n * hour,
  },
];

export const SEED_STATUS_UPDATES: StatusUpdate[] = [
  {
    id: 1n,
    content:
      "The Internet Computer is not just a blockchain. It's a world computer. And we're only at the beginning. 🌍 #ICP",
    author: "rdmx6-jaaaa-aaaaa-aaadq-cai" as any,
    timestamp: now - 30n * min,
  },
  {
    id: 2n,
    content:
      "Hot take: Motoko will be the next big smart contract language. Pattern matching + actor model = 🔥",
    author: "rrkah-fqaaa-aaaaa-aaaaq-cai" as any,
    timestamp: now - hour,
  },
  {
    id: 3n,
    content:
      "Reminder: your NFTs should live on decentralized storage. If it points to AWS, it's not really on-chain. #web3truth",
    author: "rno2w-sqaaa-aaaaa-aaacq-cai" as any,
    timestamp: now - 2n * hour,
  },
  {
    id: 4n,
    content:
      "Just hit 10k followers! Thank you all for the love and support 🙏 The ICP community is the best 💙",
    author: "r7inp-6aaaa-aaaaa-aaabq-cai" as any,
    timestamp: now - 3n * hour,
  },
  {
    id: 5n,
    content:
      "Building in web3 is hard. Building in web3 with zero gas fees is revolutionary. Keep going, ICP builders! 💪",
    author: "qaa6y-5yaaa-aaaaa-aaafa-cai" as any,
    timestamp: now - 5n * hour,
  },
];

export const SEED_NOTIFICATIONS: Notification[] = [
  {
    id: 1n,
    recipient: "rdmx6-jaaaa-aaaaa-aaadq-cai" as any,
    isRead: false,
    message: "Marcus Webb liked your post about NFT marketplace",
    timestamp: now - 30n * min,
  },
  {
    id: 2n,
    recipient: "rdmx6-jaaaa-aaaaa-aaadq-cai" as any,
    isRead: false,
    message: "Zara Patel started following you",
    timestamp: now - hour,
  },
  {
    id: 3n,
    recipient: "rdmx6-jaaaa-aaaaa-aaadq-cai" as any,
    isRead: false,
    message:
      "Leo Santos commented: 'Amazing work! The IC really is the future!'",
    timestamp: now - 2n * hour,
  },
  {
    id: 4n,
    recipient: "rdmx6-jaaaa-aaaaa-aaadq-cai" as any,
    isRead: true,
    message: "Alice Moon sent you a message",
    timestamp: now - 6n * hour,
  },
  {
    id: 5n,
    recipient: "rdmx6-jaaaa-aaaaa-aaadq-cai" as any,
    isRead: true,
    message: "Marcus Webb mentioned you in a post",
    timestamp: now - 8n * hour,
  },
];

export const SEED_MESSAGES: DirectMessage[] = [
  {
    id: 1n,
    text: "Hey! Loved your NFT marketplace post. Would love to collaborate sometime!",
    sender: "rrkah-fqaaa-aaaaa-aaaaq-cai" as any,
    recipient: "rdmx6-jaaaa-aaaaa-aaadq-cai" as any,
    timestamp: now - 2n * hour,
  },
  {
    id: 2n,
    text: "Thanks Marcus! I'd love that. DM me the details 😊",
    sender: "rdmx6-jaaaa-aaaaa-aaadq-cai" as any,
    recipient: "rrkah-fqaaa-aaaaa-aaaaq-cai" as any,
    timestamp: now - hour,
  },
  {
    id: 3n,
    text: "Check out my new research on IC tokenomics — I think you'll find it interesting for your DeFi work!",
    sender: "rno2w-sqaaa-aaaaa-aaacq-cai" as any,
    recipient: "rdmx6-jaaaa-aaaaa-aaadq-cai" as any,
    timestamp: now - 3n * hour,
  },
];

export const TRENDING_TOPICS = [
  { tag: "#InternetComputer", posts: 2841 },
  { tag: "#ICPTokens", posts: 1523 },
  { tag: "#Motoko", posts: 987 },
  { tag: "#Web3", posts: 843 },
  { tag: "#DeFi", posts: 721 },
  { tag: "#NFT", posts: 654 },
];
