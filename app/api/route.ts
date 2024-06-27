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

const DONATION_DESTINATION_WALLET =
  "CHDBDZ7T5LCfUDzJUtKqcePVpYWoH2tegBUEv1GbDga";
const DONATION_AMOUNT_SOL_OPTIONS = [0.01, 0.05, 0.1];
const DEFAULT_DONATION_AMOUNT_SOL = 0.1;

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
  const icon =
    "https://ucarecdn.com/f756b9f9-2f78-471e-95d1-f2fcec0c76dd/-/preview/1000x1000/-/quality/smart/-/format/auto/";
  const title = "Donate to Ameowagi";
  const description =
    "Buy the creator of this action a coffee by donating a small amount of SOL!";
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
