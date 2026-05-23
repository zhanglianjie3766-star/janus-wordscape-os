import type { WordCard } from './types';
import { normalizeSafeAudioReference } from './security';

const FALLBACK_PHONETICS: Record<string, string> = {
  'workspace': '/ˈwɝːkˌspeɪs/',
  'command palette': '/kəˈmænd ˈpælət/',
  'extension': '/ɪkˈstenʃən/',
  'sidebar': '/ˈsaɪdˌbɑːr/',
  'settings': '/ˈsetɪŋz/',
  'completion': '/kəmˈpliːʃən/',
  'inline chat': '/ˈɪnˌlaɪn tʃæt/',
  'prompt': '/prɑːmpt/',
  'diff': '/dɪf/',
  'apply patch': '/əˈplaɪ pætʃ/',
  'agent mode': '/ˈeɪdʒənt moʊd/',
  'checkpoint': '/ˈtʃekˌpɔɪnt/',
  'branch': '/bræntʃ/',
  'commit': '/kəˈmɪt/',
  'pull request': '/pʊl rɪˈkwest/',
  'terminal': '/ˈtɝːmənəl/',
  'environment variable': '/ɪnˈvaɪrənmənt ˈveriəbəl/',
  'stack trace': '/stæk treɪs/',
  'dependency': '/dɪˈpendənsi/',
  'lockfile': '/ˈlɑːkˌfaɪl/',
  'model': '/ˈmɑːdəl/',
  'endpoint': '/ˈendˌpɔɪnt/',
  'response': '/rɪˈspɑːns/',
  'request': '/rɪˈkwest/',
  'token': '/ˈtoʊkən/',
  'context window': '/ˈkɑːntekst ˈwɪndoʊ/',
  'system message': '/ˈsɪstəm ˈmesɪdʒ/',
  'tool call': '/tuːl kɔːl/',
  'function calling': '/ˈfʌŋkʃən ˈkɔːlɪŋ/',
  'structured output': '/ˈstrʌktʃɚd ˈaʊtpʊt/',
  'embedding': '/ɪmˈbedɪŋ/',
  'vector store': '/ˈvektɚ stɔːr/',
  'retrieval': '/rɪˈtriːvəl/',
  'rerank': '/ˌriːˈræŋk/',
  'batch': '/bætʃ/',
  'rate limit': '/reɪt ˈlɪmɪt/',
  'quota': '/ˈkwoʊtə/',
  'temperature': '/ˈtemprətʃɚ/',
  'reasoning effort': '/ˈriːzənɪŋ ˈefɚt/',
  'safety policy': '/ˈseɪfti ˈpɑːləsi/',
  'module': '/ˈmɑːdʒuːl/',
  'import': '/ɪmˈpɔːrt/',
  'export': '/ɪkˈspɔːrt/',
  'interface': '/ˈɪntɚˌfeɪs/',
  'type alias': '/taɪp ˈeɪliəs/',
  'promise': '/ˈprɑːmɪs/',
  'async': '/eɪˈsɪŋk/',
  'await': '/əˈweɪt/',
  'callback': '/ˈkɔːlˌbæk/',
  'event loop': '/ɪˈvent luːp/',
  'runtime': '/ˈrʌnˌtaɪm/',
  'package manager': '/ˈpækɪdʒ ˈmænɪdʒɚ/',
  'script': '/skrɪpt/',
  'build': '/bɪld/',
  'bundle': '/ˈbʌndəl/',
  'transpile': '/trænzˈpaɪl/',
  'linter': '/ˈlɪntɚ/',
  'test runner': '/test ˈrʌnɚ/',
  'exception': '/ɪkˈsepʃən/',
  'configuration': '/kənˌfɪɡjəˈreɪʃən/',
  'deployment': '/dɪˈplɔɪmənt/',
  'preview': '/ˈpriːˌvjuː/',
  'rollback': '/ˈroʊlˌbæk/',
  'environment': '/ɪnˈvaɪrənmənt/',
  'secret': '/ˈsiːkrət/',
  'build log': '/bɪld lɔːɡ/',
  'pipeline': '/ˈpaɪpˌlaɪn/',
  'workflow': '/ˈwɝːkˌfloʊ/',
  'action': '/ˈækʃən/',
  'artifact': '/ˈɑːrtəˌfækt/',
  'container': '/kənˈteɪnɚ/',
  'image': '/ˈɪmɪdʒ/',
  'volume': '/ˈvɑːljuːm/',
  'registry': '/ˈredʒɪstri/',
  'region': '/ˈriːdʒən/',
  'latency': '/ˈleɪtənsi/',
  'permission': '/pɚˈmɪʃən/',
  'role': '/roʊl/',
  'issue': '/ˈɪʃuː/',
  'wallet': '/ˈwɑːlɪt/',
  'seed phrase': '/siːd freɪz/',
  'private key': '/ˈpraɪvət kiː/',
  'public address': '/ˈpʌblɪk əˈdres/',
  'gas fee': '/ɡæs fiː/',
  'transaction': '/trænˈzækʃən/',
  'nonce': '/nɑːns/',
  'block': '/blɑːk/',
  'smart contract': '/smɑːrt ˈkɑːntrækt/',
  'abi': '/ˌeɪ biː ˈaɪ/',
  'rpc endpoint': '/ˌɑːr piː ˈsiː ˈendˌpɔɪnt/',
  'chain id': '/tʃeɪn ˌaɪ ˈdiː/',
  'allowance': '/əˈlaʊəns/',
  'signature': '/ˈsɪɡnətʃɚ/',
  'bridge': '/brɪdʒ/',
  'explorer': '/ɪkˈsplɔːrɚ/',
  'liquidity pool': '/lɪˈkwɪdəti puːl/',
  'slippage': '/ˈslɪpɪdʒ/',
  'audit': '/ˈɔːdɪt/',
  'frame': '/freɪm/',
  'auto layout': '/ˈɔːtoʊ ˈleɪaʊt/',
  'component': '/kəmˈpoʊnənt/',
  'variant': '/ˈveriənt/',
  'constraint': '/kənˈstreɪnt/',
  'prototype': '/ˈproʊtəˌtaɪp/',
  'interaction': '/ˌɪntɚˈækʃən/',
  'breakpoint': '/ˈbreɪkˌpɔɪnt/',
  'responsive': '/rɪˈspɑːnsɪv/',
  'design system': '/dɪˈzaɪn ˈsɪstəm/',
  'style': '/staɪl/',
  'layer': '/ˈleɪɚ/',
  'asset': '/ˈæset/',
  'handoff': '/ˈhændˌɔːf/',
  'wireframe': '/ˈwaɪɚˌfreɪm/',
  'user journey': '/ˈjuːzɚ ˈdʒɝːni/',
  'usability test': '/ˌjuːzəˈbɪləti test/',
  'copywriting': '/ˈkɑːpiˌraɪtɪŋ/'
};

function normalizeHeadword(value: string) {
  return value.trim().toLowerCase().replace(/\s+/g, ' ');
}

export function getCardPhonetic(card: Pick<WordCard, 'headword' | 'phonetic'>) {
  return card.phonetic ?? FALLBACK_PHONETICS[normalizeHeadword(card.headword)] ?? null;
}

export function getPronunciationAccentLabel(card: Pick<WordCard, 'audio_accent'>) {
  return card.audio_accent === 'UK' ? '英' : '美';
}

type PronunciationCard = Pick<WordCard, 'headword' | 'audio_url' | 'audio_asset_id' | 'audio_accent'>;

function getSpeechText(card: PronunciationCard) {
  return card.headword.replace(/[_-]+/g, ' ').replace(/\s+/g, ' ').trim();
}

function getDictionaryAudioUrl(text: string, accent?: WordCard['audio_accent']) {
  return `https://dict.youdao.com/dictvoice?audio=${encodeURIComponent(text)}&type=${accent === 'UK' ? '1' : '2'}`;
}

function buildPronunciationAudioUrls(card: PronunciationCard) {
  const text = getSpeechText(card);
  const urls: string[] = [];

  if (card.audio_url) {
    const safeAudioUrl = normalizeSafeAudioReference(card.audio_url);
    if (safeAudioUrl) {
      urls.push(safeAudioUrl);
    }
  }

  if (card.audio_asset_id) {
    const safeAudioAsset = normalizeSafeAudioReference(card.audio_asset_id);
    if (safeAudioAsset) {
      urls.push(safeAudioAsset);
    }
  }

  // Public dictionary audio is a no-key fallback for browsers where Web Speech is silent or unavailable.
  urls.push(getDictionaryAudioUrl(text, card.audio_accent));

  return urls;
}

function buildDictionaryWordSequence(card: PronunciationCard) {
  const words = getSpeechText(card).split(' ').filter(Boolean);
  return words.length > 1 ? words.map((word) => getDictionaryAudioUrl(word, card.audio_accent)) : [];
}

function speakWithWebSpeech(card: PronunciationCard) {
  if (!('speechSynthesis' in window)) {
    return false;
  }

  const text = getSpeechText(card);
  const lang = card.audio_accent === 'UK' ? 'en-GB' : 'en-US';
  const voices = window.speechSynthesis.getVoices();
  const voice = voices.find((candidate) => candidate.lang === lang) ?? voices.find((candidate) => candidate.lang.startsWith(lang.slice(0, 2)));

  window.speechSynthesis.cancel();
  const utterance = new SpeechSynthesisUtterance(text);
  utterance.lang = lang;
  if (voice) {
    utterance.voice = voice;
  }
  utterance.rate = 0.86;
  utterance.pitch = 1;
  window.speechSynthesis.speak(utterance);
  return true;
}

function playAudioUrls(urls: string[], fallback: () => void) {
  const [url, ...rest] = urls;
  if (!url) {
    fallback();
    return;
  }

  const audio = new Audio(url);
  audio.preload = 'auto';
  audio.onerror = () => playAudioUrls(rest, fallback);
  audio.onstalled = () => playAudioUrls(rest, fallback);

  void audio.play().catch(() => {
    playAudioUrls(rest, fallback);
  });
}

function playAudioSequence(urls: string[], fallback: () => void) {
  const [url, ...rest] = urls;
  if (!url) {
    fallback();
    return;
  }

  const audio = new Audio(url);
  audio.preload = 'auto';
  audio.onended = () => playAudioSequence(rest, fallback);
  audio.onerror = () => playAudioSequence(rest, fallback);
  audio.onstalled = () => playAudioSequence(rest, fallback);

  void audio.play().catch(() => {
    playAudioSequence(rest, fallback);
  });
}

export function playCardPronunciation(card: PronunciationCard) {
  playAudioUrls(buildPronunciationAudioUrls(card), () => {
    const wordSequence = buildDictionaryWordSequence(card);
    if (wordSequence.length > 0) {
      playAudioSequence(wordSequence, () => {
        speakWithWebSpeech(card);
      });
      return;
    }

    speakWithWebSpeech(card);
  });
}
