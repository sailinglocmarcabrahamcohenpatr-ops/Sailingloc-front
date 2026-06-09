<?php

namespace App\Entity;

use App\Repository\ReservationRepository;
use Doctrine\ORM\Mapping as ORM;
use Symfony\Component\Validator\Constraints as Assert;

#[ORM\Entity(repositoryClass: ReservationRepository::class)]
class Reservation
{
    public const STATUT_EN_ATTENTE  = 'en_attente';
    public const STATUT_CONFIRMEE   = 'confirmee';
    public const STATUT_ANNULEE     = 'annulee';
    public const STATUT_TERMINEE    = 'terminee';

    #[ORM\Id]
    #[ORM\GeneratedValue]
    #[ORM\Column]
    private ?int $id = null;

    #[ORM\ManyToOne(inversedBy: 'reservations')]
    #[ORM\JoinColumn(nullable: false)]
    private ?Bateau $bateau = null;

    #[ORM\ManyToOne(inversedBy: 'reservations')]
    #[ORM\JoinColumn(nullable: false)]
    private ?User $locataire = null;

    #[ORM\Column(type: 'date')]
    #[Assert\NotNull]
    private ?\DateTimeInterface $dateDebut = null;

    #[ORM\Column(type: 'date')]
    #[Assert\NotNull]
    #[Assert\GreaterThan(propertyPath: 'dateDebut')]
    private ?\DateTimeInterface $dateFin = null;

    #[ORM\Column]
    private int $nombrePersonnes = 1;

    /** Montant total en centimes */
    #[ORM\Column]
    private int $montantTotalCentimes = 0;

    /** Frais de service en centimes (ex: 10% du montant) */
    #[ORM\Column]
    private int $fraisServiceCentimes = 0;

    #[ORM\Column(length: 20)]
    private string $statut = self::STATUT_EN_ATTENTE;

    #[ORM\Column]
    private \DateTimeImmutable $createdAt;

    #[ORM\OneToOne(mappedBy: 'reservation', cascade: ['persist', 'remove'])]
    private ?Paiement $paiement = null;

    public function __construct()
    {
        $this->createdAt = new \DateTimeImmutable();
    }

    public function getId(): ?int { return $this->id; }

    public function getBateau(): ?Bateau { return $this->bateau; }
    public function setBateau(?Bateau $bateau): static { $this->bateau = $bateau; return $this; }

    public function getLocataire(): ?User { return $this->locataire; }
    public function setLocataire(?User $locataire): static { $this->locataire = $locataire; return $this; }

    public function getDateDebut(): ?\DateTimeInterface { return $this->dateDebut; }
    public function setDateDebut(\DateTimeInterface $dateDebut): static { $this->dateDebut = $dateDebut; return $this; }

    public function getDateFin(): ?\DateTimeInterface { return $this->dateFin; }
    public function setDateFin(\DateTimeInterface $dateFin): static { $this->dateFin = $dateFin; return $this; }

    public function getNombreJours(): int
    {
        return (int) $this->dateDebut->diff($this->dateFin)->days;
    }

    public function getNombrePersonnes(): int { return $this->nombrePersonnes; }
    public function setNombrePersonnes(int $nombrePersonnes): static { $this->nombrePersonnes = $nombrePersonnes; return $this; }

    public function getMontantTotalCentimes(): int { return $this->montantTotalCentimes; }
    public function setMontantTotalCentimes(int $montantTotalCentimes): static { $this->montantTotalCentimes = $montantTotalCentimes; return $this; }

    public function getMontantTotalEuros(): float { return $this->montantTotalCentimes / 100; }

    public function getFraisServiceCentimes(): int { return $this->fraisServiceCentimes; }
    public function setFraisServiceCentimes(int $fraisServiceCentimes): static { $this->fraisServiceCentimes = $fraisServiceCentimes; return $this; }

    public function getFraisServiceEuros(): float { return $this->fraisServiceCentimes / 100; }

    public function getMontantBateauCentimes(): int { return $this->montantTotalCentimes - $this->fraisServiceCentimes; }

    public function getStatut(): string { return $this->statut; }
    public function setStatut(string $statut): static { $this->statut = $statut; return $this; }

    public function getCreatedAt(): \DateTimeImmutable { return $this->createdAt; }

    public function getPaiement(): ?Paiement { return $this->paiement; }
    public function setPaiement(?Paiement $paiement): static
    {
        if ($paiement === null && $this->paiement !== null) {
            $this->paiement->setReservation(null);
        }
        if ($paiement !== null && $paiement->getReservation() !== $this) {
            $paiement->setReservation($this);
        }
        $this->paiement = $paiement;
        return $this;
    }

    public function calculerMontant(): void
    {
        if ($this->bateau === null) return;
        $montantBateau = $this->bateau->getPrixJourCentimes() * $this->getNombreJours();
        $fraisService = (int) round($montantBateau * 0.10); // 10% de frais de service
        $this->fraisServiceCentimes = $fraisService;
        $this->montantTotalCentimes = $montantBateau + $fraisService;
    }
}
