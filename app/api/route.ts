import {
  LAMPORTS_PER_SOL,
  PublicKey,
  SystemProgram,
  Transaction,
  clusterApiUrl,
  Connection,
} from "@solana/web3.js";
import {
  ActionGetResponse,
  ActionPostRequest,
  ActionPostResponse,
  ACTIONS_CORS_HEADERS,
  createPostResponse,
} from "@solana/actions";
import Decimal from "decimal.js";

const DONATION_DESTINATION_WALLET =
  process.env.RECIPIENT ?? "CHDBDZ7T5LCfUDzJUtKqcePVpYWoH2tegBUEv1GbDga";
const DEFAULT_DONATION_AMOUNT_SOL = process.env.DEFAULTAMOUNT
  ? parseFloat(process.env.DEFAULTAMOUNT)
  : 0.1;
const dAmount = new Decimal(DEFAULT_DONATION_AMOUNT_SOL);
const DONATION_AMOUNT_SOL_OPTIONS = [
  dAmount.mul(0.1).toNumber(),
  dAmount.mul(0.5).toNumber(),
  DEFAULT_DONATION_AMOUNT_SOL,
];

export const OPTIONS = GET;

export function GET(req: Request) {
  const requestUrl = new URL(req.url!);
  const amount =
    requestUrl.searchParams.get("amount") ??
    DEFAULT_DONATION_AMOUNT_SOL.toString();
  const { icon, title, description } = getDonateInfo();
  const response: ActionGetResponse = {
    icon,
    label: `Donate ${amount} SOL`,
    title,
    description,
    links: {
      actions: [
        ...DONATION_AMOUNT_SOL_OPTIONS.map((amount) => ({
          label: `${amount} SOL`,
          href: `/api?amount=${amount}`,
        })),
        {
          href: `/api?amount=${amount}`,
          label: "Donate",
          parameters: [
            {
              name: "amount",
              label: "Enter a custom SOL amount",
            },
          ],
        },
      ],
    },
  };

  return new Response(JSON.stringify(response), {
    headers: ACTIONS_CORS_HEADERS,
  });
}

export async function POST(req: Request) {
  const requestUrl = new URL(req.url!);
  const amount =
    requestUrl.searchParams.get("amount") ??
    DEFAULT_DONATION_AMOUNT_SOL.toString();

  const { account } = (await req.json()) as ActionPostRequest;

  const parsedAmount = parseFloat(amount);
  const transaction = await prepareDonateTransaction(
    new PublicKey(account),
    new PublicKey(DONATION_DESTINATION_WALLET),
    parsedAmount * LAMPORTS_PER_SOL
  );
  const payload: ActionPostResponse = await createPostResponse({
    fields: {
      transaction,
      message: `Send ${amount} SOL to ${DONATION_DESTINATION_WALLET}`,
    },
  });

  return new Response(JSON.stringify(payload), {
    headers: ACTIONS_CORS_HEADERS,
  });
}

function getDonateInfo(): Pick<
  ActionGetResponse,
  "icon" | "title" | "description"
> {
  const { icon, title, description } = {
    icon:
      process.env.AVATAR ??
      "https://ucarecdn.com/f756b9f9-2f78-471e-95d1-f2fcec0c76dd/-/preview/1000x1000/-/quality/smart/-/format/auto/",
    title: process.env.TITLE ?? "Donate to Ameowagi",
    description:
      process.env.DESCRIPTION ??
      "Buy the creator of this action a coffee by donating a small amount of SOL!",
  };
  return { icon, title, description };
}

const rpcUrl = clusterApiUrl("mainnet-beta");
const connection = new Connection(rpcUrl);
async function prepareDonateTransaction(
  sender: PublicKey,
  recipient: PublicKey,
  lamports: number
): Promise<Transaction> {
  const blockhash = await connection
    .getLatestBlockhash({ commitment: "max" })
    .then((res) => res.blockhash);
  const transaction = new Transaction();
  transaction.feePayer = sender;
  transaction.add(
    SystemProgram.transfer({
      fromPubkey: sender,
      toPubkey: recipient,
      lamports: lamports,
    })
  );
  transaction.recentBlockhash = blockhash;
  return transaction;
}
