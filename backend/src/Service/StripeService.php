<?php

namespace App\Service;

use App\Entity\Paiement;
use App\Entity\Reservation;
use Stripe\Checkout\Session;
use Stripe\Exception\ApiErrorException;
use Stripe\PaymentIntent;
use Stripe\Stripe;
use Stripe\Webhook;
use Symfony\Component\DependencyInjection\Attribute\Autowire;
use Symfony\Component\Routing\Generator\UrlGeneratorInterface;

class StripeService
{
    public function __construct(
        #[Autowire('%env(STRIPE_SECRET_KEY)%')]
        private readonly string $stripeSecretKey,
        #[Autowire('%env(STRIPE_WEBHOOK_SECRET)%')]
        private readonly string $webhookSecret,
        private readonly UrlGeneratorInterface $urlGenerator,
    ) {
        Stripe::setApiKey($this->stripeSecretKey);
    }

    /**
     * Crée une session Stripe Checkout pour une réservation.
     * Redirige le client vers la page de paiement hébergée Stripe.
     */
    public function creerSessionCheckout(Reservation $reservation): Session
    {
        $bateau = $reservation->getBateau();
        $locataire = $reservation->getLocataire();

        return Session::create([
            'mode' => 'payment',
            'customer_email' => $locataire->getEmail(),
            'line_items' => [
                [
                    'price_data' => [
                        'currency' => 'eur',
                        'unit_amount' => $reservation->getMontantBateauCentimes(),
                        'product_data' => [
                            'name' => sprintf(
                                'Location %s — %s au %s',
                                $bateau->getNom(),
                                $reservation->getDateDebut()->format('d/m/Y'),
                                $reservation->getDateFin()->format('d/m/Y')
                            ),
                            'description' => sprintf(
                                '%d jour(s) · %d personne(s)',
                                $reservation->getNombreJours(),
                                $reservation->getNombrePersonnes()
                            ),
                        ],
                    ],
                    'quantity' => 1,
                ],
                [
                    'price_data' => [
                        'currency' => 'eur',
                        'unit_amount' => $reservation->getFraisServiceCentimes(),
                        'product_data' => [
                            'name' => 'Frais de service SailingLoc',
                        ],
                    ],
                    'quantity' => 1,
                ],
            ],
            'metadata' => [
                'reservation_id' => (string) $reservation->getId(),
            ],
            'success_url' => $this->urlGenerator->generate(
                'paiement_success',
                ['reservationId' => $reservation->getId()],
                UrlGeneratorInterface::ABSOLUTE_URL
            ) . '?session_id={CHECKOUT_SESSION_ID}',
            'cancel_url' => $this->urlGenerator->generate(
                'paiement_cancel',
                ['reservationId' => $reservation->getId()],
                UrlGeneratorInterface::ABSOLUTE_URL
            ),
        ]);
    }

    /**
     * Crée un PaymentIntent pour un paiement front-end personnalisé (Stripe.js).
     */
    public function creerPaymentIntent(int $montantCentimes, string $description): PaymentIntent
    {
        return PaymentIntent::create([
            'amount' => $montantCentimes,
            'currency' => 'eur',
            'description' => $description,
            'automatic_payment_methods' => ['enabled' => true],
        ]);
    }

    /**
     * Construit et vérifie l'événement webhook reçu depuis Stripe.
     *
     * @throws \UnexpectedValueException si la payload est invalide
     * @throws \Stripe\Exception\SignatureVerificationException si la signature est incorrecte
     */
    public function construireEvenementWebhook(string $payload, string $sigHeader): \Stripe\Event
    {
        return Webhook::constructEvent($payload, $sigHeader, $this->webhookSecret);
    }

    /**
     * Récupère une session Checkout Stripe à partir de son ID.
     */
    public function recupererSession(string $sessionId): Session
    {
        return Session::retrieve($sessionId);
    }

    public function getPublicKey(): string
    {
        return $_ENV['STRIPE_PUBLIC_KEY'] ?? '';
    }
}
