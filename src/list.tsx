import { Action, ActionPanel, List, LocalStorage, Icon, Color } from "@raycast/api";
import { useEffect, useState } from "react";
import { generate } from "otplib";

interface Account {
  title: string;
  secret: string;
  period: number;
  digits: number;
}

function parseTotpURL(totpUrl: string) {
  const url = new URL(totpUrl);
  if (url.protocol !== "otpauth:") return null;
  return Object.fromEntries(url.searchParams);
}

export default function Command() {
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [codes, setCodes] = useState<Record<string, string>>({});

  // Load accounts (title -> secret) from LocalStorage
  const loadAccounts = async () => {
    const response = await LocalStorage.allItems();
    const items: Account[] = Object.keys(response).map((key) => {
      const raw = String(response[key]);
      if (raw.startsWith("otpauth://")) {
        const options = parseTotpURL(raw);
        return {
          title: key,
          secret: options?.secret ?? "",
          period: options?.period ? Number(options.period) : 30,
          digits: options?.digits ? Number(options.digits) : 6,
        };
      }
      return { title: key, secret: raw, period: 30, digits: 6 };
    });
    setAccounts(items);
  };

  useEffect(() => {
    loadAccounts();
  }, []);

  // Recompute codes for all accounts, refreshed every second
  useEffect(() => {
    const refreshCodes = async () => {
      const entries = await Promise.all(
        accounts.map(async (acc) => {
          try {
            const code = await generate({ secret: acc.secret, period: acc.period, digits: acc.digits });
            return [acc.title, code] as const;
          } catch (e) {
            console.error(`Failed to generate code for ${acc.title}`, e);
            return [acc.title, "ERROR"] as const;
          }
        })
      );
      setCodes(Object.fromEntries(entries));
    };

    refreshCodes();
    const interval = setInterval(refreshCodes, 1000);
    return () => clearInterval(interval);
  }, [accounts]);

  const deleteItem = async (title: string) => {
    await LocalStorage.removeItem(title);
    await loadAccounts();
  };

  return (
    <List>
      {accounts.map((item) => {
        const code = codes[item.title] ?? "------";
        return (
          <List.Item
            key={item.title}
            title={item.title}
            subtitle={code}
            actions={
              <ActionPanel>
                <Action.Paste title="Paste Code" content={code} />
                <Action.CopyToClipboard title="Copy Code" content={code} />
                <Action
                  icon={{ source: Icon.Trash, tintColor: Color.Red }}
                  title="Delete"
                  onAction={() => deleteItem(item.title)}
                />
              </ActionPanel>
            }
          />
        );
      })}
    </List>
  );
}