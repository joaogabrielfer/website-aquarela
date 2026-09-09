#!/usr/bin/env bash
set -euo pipefail

agent_server_port="${1:-4096}"

if [[ ! "$agent_server_port" =~ ^[0-9]+$ ]] || ((agent_server_port < 1 || agent_server_port > 65535)); then
  echo "Porta inválida: $agent_server_port" >&2
  exit 64
fi

if [[ -z "${OPENCODE_SERVER_PASSWORD:-}" ]]; then
  echo "Defina OPENCODE_SERVER_PASSWORD somente na sessão do shell antes de iniciar o servidor." >&2
  exit 64
fi

if ! command -v opencode >/dev/null 2>&1; then
  echo "OpenCode não está disponível no PATH." >&2
  exit 69
fi

exec opencode serve --hostname 127.0.0.1 --port "$agent_server_port"
