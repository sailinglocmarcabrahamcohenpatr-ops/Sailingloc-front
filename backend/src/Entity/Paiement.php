<?php

namespace App\Entity;

use App\Repository\PaiementRepository;
use Doctrine\ORM\Mapping as ORM;

#[ORM\Entity(repositoryClass: PaiementRepository::class)]
class Paiement
{
    public const STATUT_EN_ATTENTE = 'en_attente';
    public const STATUT_REUSSI     = 'reussi';
    public const STATUT_ECHOUE     = 'echoue';
    public const STATUT_REMBOURSE  = 'rembourse';

    #[ORM\Id]
    #[ORM\GeneratedValue]
    #[ORM\Column]
    private ?int $id = null;

    #[ORM\OneToOne(inversedBy: 'paiement', cascade: ['persist', 'remove'])]
    #[ORM\JoinColumn(nullable: false)]
    private ?Reservation $reservation = null;

    /** ID du PaymentIntent Stripe */
    #[ORM\Column(length: 255, nullable: true)]
    private ?string $stripePaymentIntentId = null;

    /** ID de la session Stripe Checkout (optionnel) */
    #[ORM\Column(length: 255, nullable: true)]
    private ?string $stripeSessionId = null;

    #[ORM\Column]
    private int $montantCentimes;

    #[ORM\Column(length: 3)]
    private string $devise = 'EUR';

    #[ORM\Column(length: 20)]
    private string $statut = self::STATUT_EN_ATTENTE;

    #[ORM\Column]
    private \DateTimeImmutable $createdAt;

    #[ORM\Column(nullable: true)]
    private ?\DateTimeImmutable $payeAt = null;

    public function __construct()
    {
        $this->createdAt = new \DateTimeImmutable();
    }

    public function getId(): ?int { return $this->id; }

    public function getReservation(): ?Reservation { return $this->reservation; }
    public function setReservation(?Reservation $reservation): static { $this->reservation = $reservation; return $this; }

    public function getStripePaymentIntentId(): ?string { return $this->stripePaymentIntentId; }
    public function setStripePaymentIntentId(?string $stripePaymentIntentId): static { $this->stripePaymentIntentId = $stripePaymentIntentId; return $this; }

    public function getStripeSessionId(): ?string { return $this->stripeSessionId; }
    public function setStripeSessionId(?string $stripeSessionId): static { $this->stripeSessionId = $stripeSessionId; return $this; }

    public function getMontantCentimes(): int { return $this->montantCentimes; }
    public function setMontantCentimes(int $montantCentimes): static { $this->montantCentimes = $montantCentimes; return $this; }

    public function getMontantEuros(): float { return $this->montantCentimes / 100; }

    public function getDevise(): string { return $this->devise; }
    public function setDevise(string $devise): static { $this->devise = $devise; return $this; }

    public function getStatut(): string { return $this->statut; }
    public function setStatut(string $statut): static { $this->statut = $statut; return $this; }

    public function getCreatedAt(): \DateTimeImmutable { return $this->createdAt; }

    public function getPayeAt(): ?\DateTimeImmutable { return $this->payeAt; }
    public function setPayeAt(?\DateTimeImmutable $payeAt): static { $this->payeAt = $payeAt; return $this; }

    public function marquerCommeReussi(): void
    {
        $this->statut = self::STATUT_REUSSI;
        $this->payeAt = new \DateTimeImmutable();
    }
}
