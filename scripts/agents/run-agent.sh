#!/usr/bin/env bash
set -euo pipefail

if [[ $# -lt 2 || $# -gt 3 ]]; then
  echo "Uso: $0 <perfil> <arquivo-de-prompt> [titulo]" >&2
  exit 64
fi

agent_profile="$1"
agent_prompt_file="$2"
agent_title="${3:-Aquarela: $agent_profile}"

case "$agent_profile" in
  luna-builder|luna-lead|spark-page|spark-css|spark-tests|spark-a11y|spark-audit) ;;
  *)
    echo "Perfil não autorizado: $agent_profile" >&2
    exit 64
    ;;
esac

if [[ ! -f "$agent_prompt_file" ]]; then
  echo "Arquivo de prompt não encontrado: $agent_prompt_file" >&2
  exit 66
fi

if ! command -v opencode >/dev/null 2>&1; then
  echo "OpenCode não está disponível no PATH." >&2
  exit 69
fi

agent_script_dir="$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")" && pwd)"
agent_repo_root="$(cd -- "$agent_script_dir/../.." && pwd)"
agent_prompt="$(<"$agent_prompt_file")"

agent_command=(
  opencode run
  --dir "$agent_repo_root"
  --agent "$agent_profile"
  --format json
  --title "$agent_title"
)

if [[ -n "${OPENCODE_ATTACH_URL:-}" ]]; then
  agent_command+=(--attach "$OPENCODE_ATTACH_URL")
fi

exec "${agent_command[@]}" "$agent_prompt"
