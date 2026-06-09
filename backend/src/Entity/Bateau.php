<?php

namespace App\Entity;

use App\Repository\BateauRepository;
use Doctrine\Common\Collections\ArrayCollection;
use Doctrine\Common\Collections\Collection;
use Doctrine\DBAL\Types\Types;
use Doctrine\ORM\Mapping as ORM;
use Symfony\Component\Validator\Constraints as Assert;

#[ORM\Entity(repositoryClass: BateauRepository::class)]
class Bateau
{
    #[ORM\Id]
    #[ORM\GeneratedValue]
    #[ORM\Column]
    private ?int $id = null;

    #[ORM\Column(length: 255)]
    #[Assert\NotBlank]
    private ?string $nom = null;

    #[ORM\Column(length: 100)]
    #[Assert\NotBlank]
    private ?string $type = null;

    #[ORM\Column(length: 255)]
    private ?string $localisation = null;

    #[ORM\Column(type: Types::TEXT, nullable: true)]
    private ?string $description = null;

    #[ORM\Column]
    #[Assert\Positive]
    private ?int $capacitePersonnes = null;

    #[ORM\Column]
    #[Assert\PositiveOrZero]
    private ?int $longueurMetres = null;

    /** Prix par jour en centimes (évite les flottants) */
    #[ORM\Column]
    #[Assert\Positive]
    private ?int $prixJourCentimes = null;

    #[ORM\Column]
    private bool $disponible = true;

    #[ORM\Column]
    private \DateTimeImmutable $createdAt;

    #[ORM\ManyToOne(inversedBy: 'bateaux')]
    #[ORM\JoinColumn(nullable: false)]
    private ?User $proprietaire = null;

    #[ORM\OneToMany(targetEntity: Reservation::class, mappedBy: 'bateau')]
    private Collection $reservations;

    public function __construct()
    {
        $this->createdAt = new \DateTimeImmutable();
        $this->reservations = new ArrayCollection();
    }

    public function getId(): ?int { return $this->id; }

    public function getNom(): ?string { return $this->nom; }
    public function setNom(string $nom): static { $this->nom = $nom; return $this; }

    public function getType(): ?string { return $this->type; }
    public function setType(string $type): static { $this->type = $type; return $this; }

    public function getLocalisation(): ?string { return $this->localisation; }
    public function setLocalisation(string $localisation): static { $this->localisation = $localisation; return $this; }

    public function getDescription(): ?string { return $this->description; }
    public function setDescription(?string $description): static { $this->description = $description; return $this; }

    public function getCapacitePersonnes(): ?int { return $this->capacitePersonnes; }
    public function setCapacitePersonnes(int $capacitePersonnes): static { $this->capacitePersonnes = $capacitePersonnes; return $this; }

    public function getLongueurMetres(): ?int { return $this->longueurMetres; }
    public function setLongueurMetres(int $longueurMetres): static { $this->longueurMetres = $longueurMetres; return $this; }

    public function getPrixJourCentimes(): ?int { return $this->prixJourCentimes; }
    public function setPrixJourCentimes(int $prixJourCentimes): static { $this->prixJourCentimes = $prixJourCentimes; return $this; }

    /** Retourne le prix par jour en euros pour l'affichage */
    public function getPrixJourEuros(): float { return $this->prixJourCentimes / 100; }

    public function isDisponible(): bool { return $this->disponible; }
    public function setDisponible(bool $disponible): static { $this->disponible = $disponible; return $this; }

    public function getCreatedAt(): \DateTimeImmutable { return $this->createdAt; }

    public function getProprietaire(): ?User { return $this->proprietaire; }
    public function setProprietaire(?User $proprietaire): static { $this->proprietaire = $proprietaire; return $this; }

    public function getReservations(): Collection { return $this->reservations; }
}
